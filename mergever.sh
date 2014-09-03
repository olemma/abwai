#!/bin/bash
# Merge develop branch onto master assuming we are fast forwarding
#  -Alex K.

#get the branch we are in
origBranch=`git branch | sed -n '/\* /s///p'`

scriptName="abwai.user.js"
master="master"
develop="develop"

#merge branch $master onto branch $develop
git checkout $master && git merge --no-commit --no-ff -s recursive -X theirs $develop && sed -i "s|$develop/|$master/|g" $scriptName
git add $scriptName
