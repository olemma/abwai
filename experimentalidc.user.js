// ==UserScript==
// @name        ExperimentalIDC
// @author      Lemma
// @updateURL    https://gist.githubusercontent.com/Lemmata/dca570b6b0f7e73a2888/raw/experimentalidc.user.js
// @description Enhance...Enhance...Enhance
// @include     *animebytes.tv/forums.php
// @include     *animebytes.tv/forums.php?*action=viewforum*
// @include		*animebytes.tv/forums.php?*action=viewthread*
// @version     1.6
// @require     http://code.jquery.com/jquery-2.1.1.min.js
// @require		https://raw.github.com/sizzlemctwizzle/GM_config/master/gm_config.js
// @resource forumcodes	https://gist.githubusercontent.com/Lemmata/46650c919cb692401712/raw/forums.json
// @grant		GM_getResourceText
// @grant		GM_getValue
// @grant		GM_setValue
// ==/UserScript==


////////////////NOTES////////////////////////
// -extra points for unlocking whole thread?
// -extra points for streak?
// -different difficulties
// -levehstein distance
// -points based on #unlocked in thread
// -using name in post??
// -play on post basis not user (why did i ever do this lol)

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

//js is so dumb...
if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str){
    return this.indexOf(str) == 0;
  };
}

///////////////////////end copypasta///////////////////////////////////////
/** Get forum information from a resource **/
function fetchForumFields(){
	var fields = {};
	var rawText = GM_getResourceText("forumcodes");
	var forumcodes = JSON.parse(rawText);
	
    for(var i = 0; i < forumcodes.length; i++){
		fields["enable_forum_" + forumcodes[i]["id"]] = 
		{
			'label' : forumcodes[i]['name'],
			'type' : 'checkbox',
			'default' : false 
		}
	}
    console.log(fields);
	return fields;
}

/////////////settings picker/////////////////////////
var gmc_forums = new GM_configStruct(
{
  'id': 'gmc_forums', // The id used for this instance of GM_config
  'title': 'Enable Game on Forums',
  'fields': fetchForumFields()// Fields object  
});
//TODO callback reload settings on save? maybe just let them refresh

function ABPost(postID, obj){
    if(obj === undefined){
		this.attempts = 0;
    	this.postID = postID;
    	this.pStatus = 'imnew';
    }else{
    	this.attempts = obj.attempts;
        this.postID = obj.postID;
        this.pStatus = obj.pStatus;
    }
}

ABPost.prototype = {
    init: function(){
    	console.log('init post!!');
    },
    
    /* Returns if the user was successful */
    update: function(pStatus){
    	if(pStatus != 'surrender')
            this.attempts++;
        this.pStatus = pStatus;
        return (pStatus == 'solve');
    },
     
    fromJson: function(jsonObj){
        //hacky thing to copy over all data
		for(var prop in obj) this[prop] = obj[prop];
    },
    
    isVisible: function(){
    	return (this.pStatus != 'fail');
    }
};//end ABPost.prototype

function ABThread(threadID, obj){
	
    if(obj === undefined){
    	this.threadID = threadID;
    	this.postAttempts = {};
    	this.firstPostID = 0;
    	this.postCount = 0;
        this.solved = 0;
    	this.beat = false;
    }else{
    	this.threadID = obj.threadID;
    	this.firstPostID = obj.firstPost;
    	this.postCount = obj.postCount;
    	this.beat = obj.beat;
        this.postAttempts = {};
        this.solved = obj.solved;
        
        console.log("hello!!!");
    	for(var key in obj.postAttempts){
            this.postAttempts[key] = new ABPost(key, obj.postAttempts[key]);
        }
        console.log(this.postAttempts);
    }
}

ABThread.prototype = {
    init: function(){
    	console.log('init thread!!');
    },
    
   /* guestimate the number of posts */
    countPosts: function(){
        //#posts are 25 per page, plus avg on last or #pages on first page if that is only one.
        if($("div.pagenums").length != 0){
            this.postCount = $("a.page-link:last").text() * 25  - 12;
        }else{
        	this.postCount = $("div.post_block").length;
        }
    },
    
    updateFirstPost: function(){
        //get firstPostID when viewing a thread page.
        this.firstPostID = $("div.post_block:first").attr("id").slice(4);
    },
    
    updatePost: function(postID, pStatus){
        if (!(postID in this.postAttempts)){
        	this.postAttempts[postID] = new ABPost(postID);
        }
       	var success = this.postAttempts[postID].update(pStatus);
        if(success){
            this.solved++;
        }
    },
    
    isVisible: function(postID){
        if(postID in this.postAttempts){
        	return this.postAttempts[postID].isVisible();
        }
        return false;
    }
}; //end ABThread.prototype

///////////////main game object//////////////////////
var ABGame = new function(){
    this.anonName = 'play!!!';
    this.attempted = GM_SuperValue.get("attempted_posts", {});
    
    //wrap supervalue.get to turn the json objects into actual objects w/methods
    function fetchThreadAttempts(){
        var threadAttempts = {};
        var rawThreadAttempts = GM_SuperValue.get("attempted_threads", {});
        for(var key in rawThreadAttempts){
            threadAttempts[key] = new ABThread(key, rawThreadAttempts[key]);
        }
        console.log('loaded threadAttempts...');
        console.log(threadAttempts);
        return threadAttempts;
    }
    this.threadAttempts = fetchThreadAttempts();
    
    
   /** Get forum ids of all enabled forums 
     hacky thing to list all of these in GM_config code
     **/
    this.getEnabledForums = function(){
        var gmcFields = gmc_forums.fields;
        var enabledForums = [];
        for(var key in gmcFields){
            if(key.startsWith('enable_forum_') && gmcFields[key].value == true){
            	enabledForums.push(key.split('forum_')[1]);
            }
        }
        return enabledForums;
    }
    this.enabledForums = this.getEnabledForums();
    console.log(this.enabledForums);
    
	/** Return true if we are hacking this forum **/
    this.checkThread = function(){
        var forumID = $("div[id^=forum_]").attr("id").split("_")[1];
        return (this.enabledForums.indexOf(forumID) >= 0);
	}
	
    /** Hide thread creators/last posters
     * TODO: what about defeated threads/posts??
     * TODO: make it harder to cheat by hiding links to user profiles
     */
	this.anonymizeViewForum = function(){
        //check if we are playing in this forum (coincidentally we can do this with checkThread)
        if(this.checkThread()){
			/* Fix rows in idc forum view */
			$("tr[class^='row'] td:nth-child(5)").text(this.anonName);
			$("tr[class^='row'] td:nth-child(3) p a").text(this.anonName);
        }
    }

    /** Hide last posters in top level forums page for forums you are playing the game in
    	TODO: make it harder to cheat by hiding links to user profiles
    */
	this.anonymizeForumLevel = function(){
        var me = this;
        $("tr[class^='row']").each(function(){
            var forumID = $(this).find("h4.min_padding > a:first").attr("id").slice(1);
            if(me.enabledForums.indexOf(forumID) >= 0){
				console.log($(this).find("td > div > a").text(me.anonName));
            }
        });
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
        var threadID = $("input[name='thread']").attr("value");
        $("div.post_block").each(function(){	
			var uid  = $(this).attr("class").split("user_")[1];
            var postID = $(this).find("span.post_id > a:first").text().slice(1);

			if(uid != my_uid && !thisobj.isVisible(threadID, postID)){
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
	this.updateAttempt = function(threadID, postID, pStatus){
        if(!(threadID in this.threadAttempts)){
            this.threadAttempts[threadID] = new ABThread(threadID);
            this.threadAttempts[threadID].updateFirstPost();
        }
        console.log(this.threadAttempts);
        this.threadAttempts[threadID].updatePost(postID, pStatus);
        this.threadAttempts[threadID].countPosts();
        GM_SuperValue.set("attempted_threads", this.threadAttempts);
	}

	this.onGiveUp = function(threadID, postID, uid){
		unlockUser(uid);
		this.updateAttempt(threadID, postID, 'surrender');
	}

	/** Check if we have already solved a given post */
    this.isVisible = function(threadID, postID){
        if(threadID in this.threadAttempts){
        	return this.threadAttempts[threadID].isVisible(postID);
        }
        return false;
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

	this.onGuess = function(threadID, postID, uid, uname){

		console.log('Guess for ' + uid + ',' + uname);
		var guess = $('#guessText_' + postID).val();
		var goodGuess = nameMatches(guess, uname);
		if(goodGuess){
			this.scoreUp();
			unlockUser(uid);
		}else{
			this.scoreDown();
		}
		this.updateAttempt(threadID, postID, (goodGuess ? 'solve' : 'fail'));
	}


    /**
     * Setup the per post controls for the game, where the avatar used to be!
     */
	this.setupGame = function(){
		var my_uid = $("#username_menu > a").attr("href").split("=")[1];
		var threadID = $("input[name='thread']").attr("value");
        var me = this; //is this a good idea?

		//add the stuff for the game to each block
		$("div.post_block").each(function(){
			var uid  = $(this).attr("class").split("user_")[1];
			//get postID, discarding leading #
			var postID = $(this).find("span.post_id > a:first").text().slice(1);

			if(uid != my_uid && !me.isVisible(threadID, postID)){
				var uname = $(this).find("span.num_author > a:first").text();
				$(this).find("div.author_info").after(function(){
					
					var ulist = $('<ul>', {class: 'nobullet'});
					ulist.append($('<li>', {class: 'center player_score', text: 'Score: ' +
					me.getScore()}));
					ulist.append($('<li>', {class: 'center', text: 'Who am I??'}));
					ulist.append($('<li>', {class: 'center', html: $('<input>', {id:
					'guessText_' + postID,  type: 'text'})}));
					
					ulist.append($('<li>', {class: 'center', html: $('<button>',{
																	type: 'button',
																	text: 'Guess',
																	click:
                        function(){me.onGuess(threadID, postID, uid,
																	uname);}
																	})
					}));
					
					ulist.append($('<li>', {class: 'center', html: $('<button>',{ 
																	 type: 'button', 
																	 text: 'Give Up', 
																	 click:
																	 function(){me.onGiveUp(threadID, postID, uid);}
																	 })
										   }));

					ulist.append($('<li>', {class: 'center', html: $('<button>',
														{ type: 'button',
														  text: 'Forum Settings',
														  click:
														  function(){gmc_forums.open();}
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
    if(ABGame.checkThread()){
		ABGame.anonymizeViewThread();
    	ABGame.setupGame();
    }
}else{
	ABGame.anonymizeForumLevel();
}



