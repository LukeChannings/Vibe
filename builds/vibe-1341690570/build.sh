#!/bin/sh
#
# Vibe Web App build script.
# - optimises the app, concatenates scripts, minifies stylesheets, etc.
#

build=`date +"%s"`
name="vibe-$build"
dir="./builds/$name"

r.js -o baseUrl=src appDir=. dir=$dir name=../app optimizeCss=standard preserveLicenseComments=false