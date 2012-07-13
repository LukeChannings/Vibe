#!/bin/bash

#
# Vibe Web App build script,
# combines all src and lib javascript files into one app.js file,
# apart from those that are required by only certain browsers.
# moves all resources to the root and removes any extraneous
# files and folders. final output is a zip archive.
#

# exit if the require.js optimiser is not in $PATH.
# find it here: https://github.com/jrburke/r.js
if [ -z `which r.js` ]; then
	exit 1
fi

# generate a file timestamp.
timestamp=`git rev-parse HEAD`
build_dir=../htdocs/vibe-$timestamp

# run the optimiser.
r.js -o \
appDir=. \
baseUrl=src \
name=../app \
paths.lib=../lib \
paths.image=../image \
paths.stylesheet=../stylesheets \
dir=$build_dir \
optimize=uglify \
optimizeCss=standard \
findNestedDependencies=true \
removeCombined=true \
preserveLicenseComments=false \
include=util,lib/domReady,api.vibe,model.settings,ui.settingsAssistant,ui.initialiser

# change to the build root.
cd $build_dir

# move all resources to the root.
mv {images,src,lib}/* .

# concatenate all stylesheets into app.css
# this will need to change if some styles
# are conditional cross-browser.
#cat stylesheets/* > app.css

for style in stylesheets/*; do
	sed -i~ s#../images/##g $style
done

sed -i~ s#images/##g app.css

mv stylesheets/* .

# rename the notification markup.
mv api.webkitNotifications.notification.html notification.html

# patch app.js with new paths.
sed -i~ s/api\.webkitNotifications[.]//g app.js
sed -i~ s#src/##g app.js
sed -i~ s#../lib#.#g app.js
sed -i~ s#lib/##g app.html
sed -i~ s#stylesheets/##g app.js

# patch the stylesheet with new paths.
sed -i~ s#images/##g app.html app.js

# set build revision.
sed -i~ "s/buildno/$timestamp/" app.html

# remove all unnecessary files.
rm -rf *~ build* testing images lib src screenshots stylesheets designs index.html .git

# change the symlink to point to the latest.
if [ -h ../latest ]; then
	rm ../latest
fi

cd ..

ln -s $build_dir latest