/************************************************************************/
/*                                                                      */
/*      Search Site WE - Generic WebExtension - Options Page            */
/*                                                                      */
/*      Javascript for Options Page                                     */
/*                                                                      */
/*      Last Edit - 04 May 2017                                         */
/*                                                                      */
/*      Copyright (C) 2016-2017 DW-dev                                  */
/*                                                                      */
/*      Distributed under the GNU General Public License version 2      */
/*      See LICENCE.txt file and http://www.gnu.org/licenses/           */
/*                                                                      */
/************************************************************************/

/************************************************************************/
/*                                                                      */
/*  Refer to Google Chrome developer documentation:                     */
/*                                                                      */
/*  https://developer.chrome.com/extensions/optionsV2                   */
/*                                                                      */
/*  https://developer.chrome.com/extensions/storage                     */
/*                                                                      */
/************************************************************************/

"use strict";

/************************************************************************/

/* Global variables */

var isFirefox;
var ffVersion;

/************************************************************************/

/* Listener for options page load */

document.addEventListener("DOMContentLoaded",onLoadPage,false);

/************************************************************************/

/* Initialize on page load */

function onLoadPage(event)
{
    isFirefox = (navigator.userAgent.indexOf("Firefox") >= 0);
    
    if (isFirefox) ffVersion = navigator.userAgent.match(/Firefox\/([0-9]+)/)[1];
    
    if (isFirefox && ffVersion >= 55) document.body.setAttribute("ffversion","55");
    
    /* Load options from local storage */
    
    chrome.storage.local.get(null,
    function(object)
    {
        document.getElementById("options-defaultdomain").elements["domain"].value = object["options-defaultdomain"];
        
        document.getElementById("options-searchengine").elements["engine"].value = object["options-searchengine"];
        document.getElementById("options-countrycode").value = object["options-countrycode"];
        
        document.getElementById("options-showseparate").checked = object["options-showseparate"];
        document.getElementById("options-enclosequotes").checked = object["options-enclosequotes"];
        document.getElementById("options-opennewtab").checked = object["options-opennewtab"];
    });
    
    /* Add listener for click on save button */
    
    document.getElementById("options-save-button").addEventListener("click",onClickSave,false);
}

/************************************************************************/

/* Save options */

function onClickSave(event)
{
    /* Save options to local storage */
    
    chrome.storage.local.set(
    {
        "options-defaultdomain": document.getElementById("options-defaultdomain").elements["domain"].value,
        
        "options-searchengine": document.getElementById("options-searchengine").elements["engine"].value,
        "options-countrycode": document.getElementById("options-countrycode").value,
        
        "options-showseparate": document.getElementById("options-showseparate").checked,
        "options-enclosequotes": document.getElementById("options-enclosequotes").checked,
        "options-opennewtab": document.getElementById("options-opennewtab").checked
    });
    
    /* Display saved status for short period */
    
    document.getElementById("options-save-status").style.setProperty("visibility","visible","");
    
    setTimeout(function()
	{
        document.getElementById("options-save-status").style.setProperty("visibility","hidden","");
    }
    ,1000);
}

/************************************************************************/
