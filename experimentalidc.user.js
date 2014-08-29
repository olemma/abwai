// ==UserScript==
// @name        ExperimentalIDC
// @author      Lemma
// @description Enhance...Enhance...Enhance
// @include     *animebytes.tv/forums.php?*action=viewforum&forumid=49*
// @include		*animebytes.tv/forums.php?action=viewthread*
// @version     0.1.0
// @require     http://code.jquery.com/jquery-2.1.1.min.js
// ==/UserScript==

var ANON_NAME = 'bclaude';

var viewforumURLMatcher = /.*action=viewforum.*$/i;
if(viewforumURLMatcher.test(window.location.href)){
    anonymizeViewForum();
}else{
	anonymizeViewThread();
}


function anonymizeViewForum(){
	/* Fix rows in idc forum view */
	$("tr[class^='row'] td:nth-child(5)").text(ANON_NAME);
	$("tr[class^='row'] td:nth-child(3) p a").text(ANON_NAME);
}

function anonymizeViewThread(){
    
    //we are in idc?
    if($("#forum_49").length != 0){
    	//trash the name
        $("span.num_author").text(ANON_NAME);
        //trash avvie
        $("div.author_info").text("");
        //trash siggie
        $("div.signature").text("");
        //trash quote-name
        $("div.post strong a").text(ANON_NAME);
        //trash last-edit
        $("span.last-edited a").text(ANON_NAME);
    }
}