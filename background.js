/************************************************************************/
/*                                                                      */
/*      Search Site WE - Generic WebExtension - Background Page         */
/*                                                                      */
/*      Javascript for Background Page                                  */
/*                                                                      */
/*      Last Edit - 04 May 2017                                         */
/*                                                                      */
/*      Copyright (C) 2009-2017 DW-dev                                  */
/*                                                                      */
/*      Distributed under the GNU General Public License version 2      */
/*      See LICENCE.txt file and http://www.gnu.org/licenses/           */
/*                                                                      */
/************************************************************************/

/************************************************************************/
/*                                                                      */
/*  Refer to Google Chrome developer documentation:                     */
/*                                                                      */
/*  https://developer.chrome.com/extensions/overview                    */
/*  https://developer.chrome.com/extensions/activeTab                   */
/*  https://developer.chrome.com/extensions/messaging                   */
/*  https://developer.chrome.com/extensions/optionsV2                   */
/*  https://developer.chrome.com/extensions/contentSecurityPolicy       */
/*                                                                      */
/*  https://developer.chrome.com/extensions/manifest                    */
/*  https://developer.chrome.com/extensions/declare_permissions         */
/*                                                                      */
/*  https://developer.chrome.com/extensions/pageAction                  */
/*  https://developer.chrome.com/extensions/contextMenus                */
/*  https://developer.chrome.com/extensions/notifications               */
/*  https://developer.chrome.com/extensions/runtime                     */
/*  https://developer.chrome.com/extensions/storage                     */
/*  https://developer.chrome.com/extensions/tabs                        */
/*  https://developer.chrome.com/extensions/webNavigation               */
/*                                                                      */
/************************************************************************/

"use strict";

/************************************************************************/

/* Global variables */

var defaultDomain;
var searchEngine,countryCode;
var showSeparate,encloseQuotes,openNewTab;

var globalEngines = new Array("https://www.google.com/search?q=",
                              "https://www.bing.com/search?q=",
                              "https://search.yahoo.com/search?p=",
                              "http://www.ask.com/web?q=",
                              "https://duckduckgo.com/?q=");

var localEngines = new Array("https://www.google.##/search?q=",
                             "https://www.bing.com/search?cc=##&q=",
                             "https://##.search.yahoo.com/search?p=",
                             "http://##.ask.com/web?q=",
                             "");

/************************************************************************/

/* Initialize on browser startup */

chrome.storage.local.get(null,
function(object)
{
    /* Initialize or migrate options */

    if (!("options-defaultdomain" in object)) object["options-defaultdomain"] = 0;

    if (!("options-searchengine" in object)) object["options-searchengine"] = 0;
    if (!("options-countrycode" in object)) object["options-countrycode"] = "uk";

    if (!("options-showseparate" in object)) object["options-showseparate"] = false;
    if (!("options-enclosequotes" in object)) object["options-enclosequotes"] = false;
    if (!("options-opennewtab" in object)) object["options-opennewtab"] = false;

    object["popup-searchtext"] = "";
    if (!("popup-opennewtab" in object)) object["popup-opennewtab"] = false;

    /* Update stored options */

    chrome.storage.local.set(object);

    /* Initialize local options */

    defaultDomain = object["options-defaultdomain"];

    searchEngine = object["options-searchengine"];
    countryCode = object["options-countrycode"];

    showSeparate = object["options-showseparate"];
    encloseQuotes = object["options-enclosequotes"];
    openNewTab = object["options-opennewtab"];

    /* Add context menu items */

    if (showSeparate)
    {
        chrome.contextMenus.create({ id: "subdomain", title: "Search Subdomain", contexts: [ "selection", "page" ], enabled: true });
        chrome.contextMenus.create({ id: "entiredomain", title: "Search Entire Domain", contexts: [ "selection", "page" ], enabled: true });
    }
    else chrome.contextMenus.create({ id: "defaultdomain", title: "Search Default Domain", contexts: [ "selection", "page" ], enabled: true });

    /* Add listeners */

    addListeners();
});

/************************************************************************/

/* Add listeners */

function addListeners()
{
    /* Storage changed listener */

    chrome.storage.onChanged.addListener(
    function(changes,areaName)
    {
        chrome.storage.local.get(null,
        function(object)
        {
            defaultDomain = object["options-defaultdomain"];

            searchEngine = object["options-searchengine"];
            countryCode = object["options-countrycode"];

            showSeparate = object["options-showseparate"];
            encloseQuotes = object["options-enclosequotes"];
            openNewTab = object["options-opennewtab"];

            /* Update context menu items */

            chrome.contextMenus.removeAll();

            if (showSeparate)
            {
                chrome.contextMenus.create({ id: "subdomain", title: "Search Subdomain", contexts: [ "selection", "page" ], enabled: true });
                chrome.contextMenus.create({ id: "entiredomain", title: "Search Entire Domain", contexts: [ "selection", "page" ], enabled: true });
            }
            else chrome.contextMenus.create({ id: "defaultdomain", title: "Search Default Domain", contexts: [ "selection", "page" ], enabled: true });
        });
    });

    /* Context menu listener */

    chrome.contextMenus.onClicked.addListener(
    function(info,tab)
    {
        if (encloseQuotes) info.selectionText = "\"" + info.selectionText + "\"";

        if (info.menuItemId == "defaultdomain") searchSiteForText(defaultDomain,info.selectionText,openNewTab);
        else if (info.menuItemId == "subdomain") searchSiteForText(0,info.selectionText,openNewTab);
        else if (info.menuItemId == "entiredomain") searchSiteForText(1,info.selectionText,openNewTab);
    });

    /* Web navigation listeners */

    chrome.webNavigation.onBeforeNavigate.addListener(
    function(details)
    {
        try { chrome.pageAction.show(details.tabId); } catch (e) { }  /* Firefox - avoids 'tab is not a non-null object' errors */  /*???*/
    });

    chrome.webNavigation.onCommitted.addListener(
    function(details)
    {
        try { chrome.pageAction.show(details.tabId); } catch (e) { }  /* Firefox - avoids 'tab is not a non-null object' errors */  /*???*/
    });

    chrome.webNavigation.onDOMContentLoaded.addListener(
    function(details)
    {
        try { chrome.pageAction.show(details.tabId); } catch (e) { }  /* Firefox - avoids 'tab is not a non-null object' errors */  /*???*/
    });

    chrome.webNavigation.onCompleted.addListener(
    function(details)
    {
        try { chrome.pageAction.show(details.tabId); } catch (e) { }  /* Firefox - avoids 'tab is not a non-null object' errors */  /*???*/
    });

    /* Tab event listeners */

    chrome.tabs.onActivated.addListener(
    function(activeInfo)
    {
        chrome.tabs.query({ lastFocusedWindow: true, active: true },
        function(tabs)
        {
            chrome.pageAction.show(tabs[0].id);
        });
    });

    chrome.tabs.onUpdated.addListener(
    function(tabId,changeInfo,tab)
    {
        chrome.pageAction.show(tabId);
    });

    /* Message received listener */

    chrome.runtime.onMessage.addListener(
    function(message,sender,sendResponse)
    {
        /* Messages from popup script */

        if (message.type == "keypressTextbox")
        {
            searchSiteForText(defaultDomain,message.text,message.newtab);
        }
        else if (message.type == "clickSubdomain")
        {
            searchSiteForText(0,message.text,message.newtab);
        }
        else if (message.type == "clickEntireDomain")
        {
            searchSiteForText(1,message.text,message.newtab);
        }
    });
}

/************************************************************************/

/* Search site for entered or selected text */

function searchSiteForText(domainType,searchText,newTab)
{
    chrome.tabs.query({ lastFocusedWindow: true, active: true },
    function(tabs)
    {
        var i,currentURL,suffixLength,domain,searchURL;
        var fields = new Array();
        var parts = new Array();

        currentURL = tabs[0].url;

        fields = currentURL.match(/(.+:\/\/)([^:/?#]*)(:[^/?#]*)?(\/[^?#]*)?(\?[^#]*)?(#.*)?/);

        parts = fields[2].split(".");
        suffixLength = getPublicSuffix(fields[2]).split(".").length;

        if (domainType == 0) domain = fields[2];
        else
        {
            domain = parts[parts.length-suffixLength-1];
            for (i = parts.length-suffixLength; i < parts.length; i++) domain += "." + parts[i];
        }

        searchText += " site:" + domain;

        if (localEngines[searchEngine] != "" && countryCode != "")
        {
            searchURL = localEngines[searchEngine];

            if (searchEngine == 0 && countryCode == "uk") searchURL = searchURL.replace("##","co.uk");
            else if (searchEngine == 1 && countryCode == "uk") searchURL = searchURL.replace("##","gb");
            else searchURL = searchURL.replace("##",countryCode);
        }
        else searchURL = globalEngines[searchEngine];

        if (newTab) chrome.tabs.create({ url: searchURL + searchText, index: tabs[0].index+1, active: true });
        else chrome.tabs.update(tabs[0].id, { url: searchURL + searchText });
    });
}

/************************************************************************/

/* Display debug notification */

function debugNotify(message)
{
    chrome.notifications.create("debug",{ type: "basic", iconUrl: "icon32.png", title: "SEARCH SITE WE - DEBUG", message: "" + message });
}

/************************************************************************/
