// ==UserScript==
// @name        ExperimentalIDC
// @author      Lemma
// @updateURL    https://gist.githubusercontent.com/Lemmata/dca570b6b0f7e73a2888/raw/experimentalidc.user.js
// @description Enhance...Enhance...Enhance
// @include     *animebytes.tv/forums.php
// @include     *animebytes.tv/forums.php?*action=viewforum&forumid=49*
// @include		*animebytes.tv/forums.php?*action=viewthread*
// @version     1.1
// @require     http://code.jquery.com/jquery-2.1.1.min.js
// @grant		GM_getValue
// @grant		GM_setValue
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

////////////////////////Begin copypasta//////////////////////////////
/***************************************************************************************
****************************************************************************************
*****   Super GM_setValue and GM_getValue.js
*****
*****   This library extends the Greasemonkey GM_setValue and GM_getValue functions to
*****   handle any javascript variable type.
*****
*****   Add it to your GM script with:
*****       // @require http://userscripts.org/scripts/source/107941.user.js
*****
*****
*****   Usage:
*****       GM_SuperValue.set           (varName, varValue);
*****       var x = GM_SuperValue.get   (varName, defaultValue);
*****
*****   Test mode:
*****       GM_SuperValue.runTestCases  (bUseConsole);
*****
*/

var GM_SuperValue = new function () {

    var JSON_MarkerStr  = 'json_val: ';
    var FunctionMarker  = 'function_code: ';

    function ReportError (msg) {
        if (console && console.error)
            console.log (msg);
        else
            throw new Error (msg);
    }

    //--- Check that the environment is proper.
    if (typeof GM_setValue != "function")
        ReportError ('This library requires Greasemonkey! GM_setValue is missing.');
    if (typeof GM_getValue != "function")
        ReportError ('This library requires Greasemonkey! GM_getValue is missing.');


    /*--- set ()
        GM_setValue (http://wiki.greasespot.net/GM_setValue) only stores:
        strings, booleans, and integers (a limitation of using Firefox
        preferences for storage).

        This function extends that to allow storing any data type.

        Parameters:
            varName
                String: The unique (within this script) name for this value.
                Should be restricted to valid Javascript identifier characters.
            varValue
                Any valid javascript value.  Just note that it is not advisable to
                store too much data in the Firefox preferences.

        Returns:
            undefined
    */
    this.set = function (varName, varValue) {

        if ( ! varName) {
            ReportError ('Illegal varName sent to GM_SuperValue.set().');
            return;
        }
        if (/[^\w _-]/.test (varName) ) {
            ReportError ('Suspect, probably illegal, varName sent to GM_SuperValue.set().');
        }

        switch (typeof varValue) {
            case 'undefined':
                ReportError ('Illegal varValue sent to GM_SuperValue.set().');
            break;
            case 'boolean':
            case 'string':
                //--- These 2 types are safe to store, as is.
                GM_setValue (varName, varValue);
            break;
            case 'number':
                /*--- Numbers are ONLY safe if they are integers.
                    Note that hex numbers, EG 0xA9, get converted
                    and stored as decimals, EG 169, automatically.
                    That's a feature of JavaScript.

                    Also, only a 32-bit, signed integer is allowed.
                    So we only process +/-2147483647 here.
                */
                if (varValue === parseInt (varValue)  &&  Math.abs (varValue) < 2147483647)
                {
                    GM_setValue (varName, varValue);
                    break;
                }
            case 'object':
                /*--- For all other cases (but functions), and for
                    unsafe numbers, store the value as a JSON string.
                */
                var safeStr = JSON_MarkerStr + JSON.stringify (varValue);
                GM_setValue (varName, safeStr);
            break;
            case 'function':
                /*--- Functions need special handling.
                */
                var safeStr = FunctionMarker + varValue.toString ();
                GM_setValue (varName, safeStr);
            break;

            default:
                ReportError ('Unknown type in GM_SuperValue.set()!');
            break;
        }
    }//-- End of set()


    /*--- get ()
        GM_getValue (http://wiki.greasespot.net/GM_getValue) only retieves:
        strings, booleans, and integers (a limitation of using Firefox
        preferences for storage).

        This function extends that to allow retrieving any data type -- as
        long as it was stored with GM_SuperValue.set().

        Parameters:
            varName
                String: The property name to get. See GM_SuperValue.set for details.
            defaultValue
                Optional. Any value to be returned, when no value has previously
                been set.

        Returns:
            When this name has been set...
                The variable or function value as previously set.

            When this name has not been set, and a default is provided...
                The value passed in as a default

            When this name has not been set, and default is not provided...
                undefined
    */
    this.get = function (varName, defaultValue) {

        if ( ! varName) {
            ReportError ('Illegal varName sent to GM_SuperValue.get().');
            return;
        }
        if (/[^\w _-]/.test (varName) ) {
            ReportError ('Suspect, probably illegal, varName sent to GM_SuperValue.get().');
        }

        //--- Attempt to get the value from storage.
        var varValue    = GM_getValue (varName);
        if (!varValue)
            return defaultValue;

        //--- We got a value from storage. Now unencode it, if necessary.
        if (typeof varValue == "string") {
            //--- Is it a JSON value?
            var regxp       = new RegExp ('^' + JSON_MarkerStr + '(.+)$');
            var m           = varValue.match (regxp);
            if (m  &&  m.length > 1) {
                varValue    = JSON.parse ( m[1] );
                return varValue;
            }

            //--- Is it a function?
            var regxp       = new RegExp ('^' + FunctionMarker + '((?:.|\n|\r)+)$');
            var m           = varValue.match (regxp);
            if (m  &&  m.length > 1) {
                varValue    = eval ('(' + m[1] + ')');
                return varValue;
            }
        }

        return varValue;
    }//-- End of get()
}

///////////////////////end copypasta///////////////////////////////////////
var ABGame = new function(){
	this.anonName = 'someone...';
	this.forumNo = '49';
    this.attempted = GM_SuperValue.get("attempted_posts", {});


	this.anonymizeForumLevel = function(){
		$("table:eq(1) > tbody > tr:nth-child(3) > td:nth-child(3) > div >a").text(this.anonName);
	}

	/* TODO this is forum-specific */
	this.anonymizeViewForum = function(){
		/* Fix rows in idc forum view */
		$("tr[class^='row'] td:nth-child(5)").text(this.anonName);
		$("tr[class^='row'] td:nth-child(3) p a").text(this.anonName);
	}

	/** Return true if we are hacking this forum **/
	this.checkForum = function(){
		return ($("#forum_" + this.forumNo).length != 0);
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

	this.anonymizeViewThread = function(){
		var my_uid = $("#username_menu > a").attr("href").split("=")[1];
		var thisobj = this;
        $("div.post_block").each(function(){	
			var uid  = $(this).attr("class").split("user_")[1];
            var postNo = $(this).find("span.post_id > a:first").text().slice(1);

			if(uid != my_uid && !thisobj.hasSeen(postNo)){
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
	
	/** Update attempts on a post, record how many times they have tried, and if
	 * they have solved it.
	 * pStatus should be in { 'surrender', 'fail', 'solve'}

	 * TODO: validate data.
	 */
	this.updateAttempt = function(postid, pStatus){
		if(postid in this.attempted){
			if(pStatus != 'surrender'){
				this.attempted[postid] = [this.attempted[postid][0] + 1, pStatus];
			}else{
				this.attempted[postid] = [this.attempted[postid][0], pStatus];
			}
		}else if (pStatus != 'surrender'){
			this.attempted[postid] = [1, pStatus];
		}else{
			this.attempted[postid] = [0, pStatus];
		}
		GM_SuperValue.set("attempted_posts", this.attempted);
	}

	this.onGiveUp = function(postid, uid){
		unlockUser(uid);
		this.updateAttempt(postid, 'surrender');
	}

	/** Check if we have already solved a given post */
	this.hasSeen = function(postid){
		if (postid in this.attempted){
			var pStatus = this.attempted[postid][1];
			return (pStatus != 'fail');
		}else{
			return false;
		}
	}

	this.getScore = function(){
		return GM_SuperValue.get("player_score", 0);
	}

	this.setScore = function(newScore){
		GM_SuperValue.set("player_score", newScore);
		$('li.player_score').text("Score: " + newScore);
	}

	this.scoreUp = function(){
		var newScore = this.getScore() + 1;
		this.setScore(newScore);
		console.log('score++');
		alert(":) alright...you got one\n...but you can never win\nscore: " + newScore);
	}

	this.scoreDown = function(){
		var newScore = this.getScore() - 1;
		this.setScore(newScore);
		console.log('score--');
		alert(':((((((((((((((((((\n...nice try dork\nscore: ' + newScore);
	}

	this.onGuess = function(postNo, uid, uname){

		console.log('Guess for ' + uid + ',' + uname);
		var guess = $('#guessText_' + postNo).val();
		var goodGuess = nameMatches(guess, uname);
		if(goodGuess){
			this.scoreUp();
			unlockUser(uid);
		}else{
			this.scoreDown();
		}
		this.updateAttempt(postNo, (goodGuess ? 'solve' : 'fail'));
	}


	this.setupGame = function(){
		var my_uid = $("#username_menu > a").attr("href").split("=")[1];
		var me = this; //is this a good idea?

		//add the stuff for the game to each block
		$("div.post_block").each(function(){
			var uid  = $(this).attr("class").split("user_")[1];
			//get postNo, discarding leading #
			var postNo = $(this).find("span.post_id > a:first").text().slice(1);

			if(uid != my_uid && !me.hasSeen(postNo)){
				var uname = $(this).find("span.num_author > a:first").text();
				$(this).find("div.author_info").after(function(){
					
					var ulist = $('<ul>', {class: 'nobullet'});
					ulist.append($('<li>', {class: 'center player_score', text: 'Score: ' +
					me.getScore()}));
					ulist.append($('<li>', {class: 'center', text: 'Who am I??'}));
					ulist.append($('<li>', {class: 'center', html: $('<input>', {id:
					'guessText_' + postNo,  type: 'text'})}));
					
					ulist.append($('<li>', {class: 'center', html: $('<button>',{
																	type: 'button',
																	text: 'Guess',
																	click:
																	function(){me.onGuess(postNo, uid,
																	uname);}
																	})
					}));
					
					ulist.append($('<li>', {class: 'center', html: $('<button>',{ 
																	 type: 'button', 
																	 text: 'Give Up', 
																	 click:
																	 function(){me.onGiveUp(postNo, uid);}
																	 })
										   }));

					

					return $('<div>', { class: 'author_info gameUser_' + uid, html: ulist });
				  });
			}
		});
	}
}


//do work
var viewthreadURLMatcher = /.*action=viewthread.*$/i;
var viewforumURLMatcher = /.*action=viewforum.*$/i;
if(viewforumURLMatcher.test(window.location.href)){
    ABGame.anonymizeViewForum();
}else if (viewthreadURLMatcher.test(window.location.href)){
    if(ABGame.checkForum()){
		ABGame.anonymizeViewThread();
    	ABGame.setupGame();
    }
}else{
	ABGame.anonymizeForumLevel();
}


