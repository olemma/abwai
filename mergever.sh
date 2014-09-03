#!/bin/bash
# Script will merge branch $2 onto branch $3
# Then tweak abwai.user.js in branch $3 to have correct
# references, and set the version!
#  -Alex K.

#get the branch we are in
origBranch=`git branch | sed -n '/\* /s///p'`

#merge branch $2 onto branch $3
git checkout $3
git merge --no-commit --no-ff -s recursive -X theirs $2

#update branch names in files
sed -i "s|$2/|$3/|g" "abwai.user.js"

#set version
#sed -i "s|^\(//\s*@version\s*\).*$|\1$1|g" "abwai.user.js"

git commit -am "Merged with branch $2 and updated to version $1"

#return to original branch
git checkout $origBranch
