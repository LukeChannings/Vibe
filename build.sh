#!/bin/sh
#
# Builds a flattened package file for Vibe.
#

echo $1

name="vibe-$(date +"%s")"
dir="../VibeBuilds/$name" # generate a name for the build.

r.js -o baseUrl=modules appDir=. dir=$dir name=../vibe optimizeCss=standard findNestedDependencies=true preserveLicenseComments=false # use require.js optimiser to concatenate the modules.

cd $dir

# move requirejs and soundmanager into the root.
mv modules/dependencies/{require.js,soundmanager2.{js,swf}} .

# move all png, svg and css files to the root.
find . -name \*.png -exec cp {} . \;
find . -name \*.svg -exec cp {} . \;
find . -name \*.css -exec cp {} . \;

mv images/LoadingThrobber.gif .

# remove unnecessary files.
rm -rf modules images build* Diagrams tests Vibe.esproj createMultiView.png createSingle.png createWizard.png icon_{128,256,512,1024}.png background.{svg,png} icon.icns icon_alt.svg README.md .git

# fix some paths in the source code.
sed -i '' s#modules/dependencies/## vibe.html
sed -i '' 's/[a-z]\.toUrl//g' vibe.js
sed -i '' 's/images\///g' vibe.html vibe.css manifest.json

mkdir vibe
mv * vibe

zip -r vibe.zip vibe
tar -zcvf vibe.tar.gz vibe