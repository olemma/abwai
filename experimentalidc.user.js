// ==UserScript==
// @name        ExperimentalIDC
// @author      Lemma
// @updateURL    https://gist.githubusercontent.com/Lemmata/dca570b6b0f7e73a2888/raw/experimentalidc.user.js
// @description Enhance...Enhance...Enhance
// @include     *animebytes.tv/forums.php
// @include     *animebytes.tv/forums.php?*action=viewforum&forumid=49*
// @include		*animebytes.tv/forums.php?*action=viewthread*
// @version     1.0
// @require     http://code.jquery.com/jquery-2.1.1.min.js
// ==/UserScript==


////////////////NOTES////////////////////////
// -extra points for unlocking whole thread?
// -extra points for streak?
// -levehstein distance
// -points based on #unlocked in thread
// -using name in post??
// -remember posts won
// -play on post basis not user (why did i ever do this lol)
// -GM_setvalue to pick forum(s) real settings?

var ANON_NAME = 'someone...';
var FORUM_NO = '49';

var viewthreadURLMatcher = /.*action=viewthread.*$/i;
var viewforumURLMatcher = /.*action=viewforum.*$/i;
if(viewforumURLMatcher.test(window.location.href)){
    anonymizeViewForum();
}else if (viewthreadURLMatcher.test(window.location.href)){
    if(checkForum){
		anonymizeViewThread();
    	setupGame();
        //unlockUser('9444');
    }
}else{
	anonymizeForumLevel();
}


function anonymizeForumLevel(){
    $("table:eq(1) > tbody > tr:nth-child(3) > td:nth-child(3) > div > a").text(ANON_NAME);
}

/* TODO this is forum-specific */
function anonymizeViewForum(){
	/* Fix rows in idc forum view */
	$("tr[class^='row'] td:nth-child(5)").text(ANON_NAME);
	$("tr[class^='row'] td:nth-child(3) p a").text(ANON_NAME);
}

/** Return true if we are hacking this forum **/
function checkForum(){
	return ($("#forum_" + FORUM_NO).length != 0);
}

/** TODO use edit distance or something **/
function nameMatches(observed, truth){
	return observed.toLowerCase() == truth.toLowerCase();
}


function unlockUser(uid){
    console.log("Unlocking user "  + uid);
    $("div.user_" + uid + " span.num_author").show();
    $("div.user_" + uid + " div.author_info").show();
    $("div.gameUser_" + uid).hide();
    $("div.user_" + uid + " div.signature").show();
    $("div.user_" + uid + " div.post strong a").show();
    $("div.user_" + uid + " span.last-edited a").show();
}

function anonymizeViewThread(){
	var my_uid = $("#username_menu > a").attr("href").split("=")[1];
    $("div.post_block").each(function(){	
		var uid  = $(this).attr("class").split("user_")[1];
		if(uid != my_uid){
			//trash the name
			$(this).find("span.num_author").hide();
			//trash avvie
			$(this).find("div.author_info").hide();
			//trash siggie
			$(this).find("div.signature").hide();
			//trash quote-name
			$(this).find("div.post strong a").hide();
			//trash last-edit
			$(this).find("span.last-edited a").hide();
		}
	});
}

function onGiveUp(uid){
	unlockUser(uid);
}

function getScore(){
	return GM_getValue("player_score", 0);
}

function setScore(newScore){
	GM_setValue("player_score", newScore);
	$('li.player_score').text("Score: " + newScore);
}

function scoreUp(){
    var newScore = getScore() + 1;
	setScore(newScore);
	console.log('score++');
    alert(":) alright...you got one\n...but you can never win\nscore: " + newScore);
}

function scoreDown(){
    var newScore = getScore() - 1;
	setScore(newScore);
	console.log('score--');
    alert(':((((((((((((((((((\n...nice try dork\nscore: ' + newScore);
}

function onGuess(postNo, uid, uname){

	console.log('Guess for ' + uid + ',' + uname);
	var guess = $('#guessText_' + postNo).val();
	var goodGuess = nameMatches(guess, uname);
	if(goodGuess){
		scoreUp();
		unlockUser(uid);
	}else{
		scoreDown();
	}
}


function setupGame(){
	var my_uid = $("#username_menu > a").attr("href").split("=")[1];
	
	//add the stuff for the game to each block
    $("div.post_block").each(function(){
		var uid  = $(this).attr("class").split("user_")[1];
		if(uid != my_uid){
			var uname = $(this).find("span.num_author > a:first").text();
			//get postNo discard leading #
			var postNo = $(this).find("span.post_id > a:first").text().slice(1);
			
			$(this).find("div.author_info").after(function(){
				
				var ulist = $('<ul>', {class: 'nobullet'});
				ulist.append($('<li>', {class: 'center player_score', text: 'Score: ' +
				getScore()}));
				ulist.append($('<li>', {class: 'center', text: 'Who am I??'}));
				ulist.append($('<li>', {class: 'center', html: $('<input>', {id:
				'guessText_' + postNo,  type: 'text'})}));
				
				ulist.append($('<li>', {class: 'center', html: $('<button>',{
																type: 'button',
																text: 'Guess',
																click:
																function(){onGuess(postNo, uid,
																uname);}
																})
				}));
				
				ulist.append($('<li>', {class: 'center', html: $('<button>',{ 
																 type: 'button', 
																 text: 'Give Up', 
																 click: function(){onGiveUp(uid);}
																 })
									   }));

				

				return $('<div>', { class: 'author_info gameUser_' + uid, html: ulist });
			  });
		}
	});
}

