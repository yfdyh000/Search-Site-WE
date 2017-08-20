/************************************************************************/
/*                                                                      */
/*      Search Site WE - Generic WebExtension - Popup Page              */
/*                                                                      */
/*      Javascript for Popup Page                                       */
/*                                                                      */
/*      Last Edit - 09 Nov 2016                                         */
/*                                                                      */
/*      Copyright (C) 2016 DW-dev                                       */
/*                                                                      */
/*      Distributed under the GNU General Public License version 2      */
/*      See LICENCE.txt file and http://www.gnu.org/licenses/           */
/*                                                                      */
/************************************************************************/

/************************************************************************/
/*                                                                      */
/* Refer to Google Chrome developer documentation:                      */
/*                                                                      */
/*  https://developer.chrome.com/extensions/messaging                   */
/*                                                                      */
/*  https://developer.chrome.com/extensions/runtime                     */
/*  https://developer.chrome.com/extensions/storage                     */
/*                                                                      */
/************************************************************************/

"use strict";

/************************************************************************/

/* Listener for popup page load */

document.addEventListener("DOMContentLoaded",onLoadPage,false);

/************************************************************************/

/* Initialize on page load */

function onLoadPage()
{
    /* Load options from local storage */
    
    chrome.storage.local.get(null,
    function(object)
    {
        document.getElementById("popup-textbox").value = object["popup-searchtext"];
        document.getElementById("popup-opennewtab").checked = object["popup-opennewtab"];
        
        /* Focus text box */
        
        window.setTimeout(
        function()
        {
            document.getElementById("popup-textbox").focus();
            document.getElementById("popup-textbox").select();
        },30);
        
        /* Add event listeners */
        
        document.getElementById("popup-textbox").addEventListener("keypress",onKeypressTextbox,false);
        document.getElementById("popup-subdomain").addEventListener("click",onClickSubdomain,false);
        document.getElementById("popup-entiredomain").addEventListener("click",onClickEntireDomain,false);
        document.getElementById("popup-opennewtab").addEventListener("change",onChangeNewTab,false);
    });
}

/************************************************************************/

/* Text entered */

function onKeypressTextbox(event)
{
    if (event.keyCode == 13)
    {
        saveNewTabOption();
        
        chrome.runtime.sendMessage({ type: "keypressTextbox", 
                                     text: document.getElementById("popup-textbox").value,
                                     newtab: document.getElementById("popup-opennewtab").checked });
        
        window.setTimeout(function() { window.close(); },10);
    }
}

/************************************************************************/

/* Buttons clicked */

function onClickSubdomain(event)
{
    saveNewTabOption();

    chrome.runtime.sendMessage({ type: "clickSubdomain", domain: 0,
                                 text: document.getElementById("popup-textbox").value,
                                 newtab: document.getElementById("popup-opennewtab").checked });
    
    window.setTimeout(function() { window.close(); },10);
}

function onClickEntireDomain(event)
{
    saveNewTabOption();
    
    chrome.runtime.sendMessage({ type: "clickEntireDomain", domain: 1,
                                 text: document.getElementById("popup-textbox").value,
                                 newtab: document.getElementById("popup-opennewtab").checked });
    
    window.setTimeout(function() { window.close(); },10);
}

/************************************************************************/

/* Save options */

function saveNewTabOption()
{
    chrome.storage.local.set(
    {
        "popup-searchtext": document.getElementById("popup-textbox").value,
        "popup-opennewtab": document.getElementById("popup-opennewtab").checked,
    });
}

/************************************************************************/

/* Re-focus textbox */

function onChangeNewTab()
{
    document.getElementById("popup-textbox").focus();
}

/************************************************************************/
