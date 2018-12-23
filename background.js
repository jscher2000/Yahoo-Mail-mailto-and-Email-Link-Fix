/* 
  Copyright 2018. Jefferson "jscher2000" Scher. License: MPL-2.0.
  version 0.1 - initial concept
  version 0.2 - added icons
  version 0.3 - updated icons
*/

const baseUrl = 'https://mrd.mail.yahoo.com/compose/?';

/**** Context menu item ****/

let linkcontext = browser.menus.create({
  id: "yahoomail_mailtolink",
  title: "New Yahoo Mail message",
  contexts: ["link"],
  icons: {
	"16": "icons/Ymail-16.png",
	"32": "icons/Ymail-32.png"
  }
});

let pagecontext = browser.menus.create({
  id: "yahoomail_page",
  title: "New Yahoo Mail message (page title, URL)",
  contexts: ["page"],
  icons: {
	"16": "icons/Ymail-16.png",
	"32": "icons/Ymail-32.png"
  }
});

let selcontext = browser.menus.create({
  id: "yahoomail_selection",
  title: "New Yahoo Mail message (with selected text)",
  contexts: ["selection"],
  icons: {
	"16": "icons/Ymail-16.png",
	"32": "icons/Ymail-32.png"
  }
});

browser.menus.onClicked.addListener((menuInfo, currTab) => {
	var YUrl = '';
	switch (menuInfo.menuItemId) {
		case 'yahoomail_mailtolink':
			// Check the link protocol
			var linkSplit = menuInfo.linkUrl.split(':');
			if (linkSplit[0].toLowerCase() === 'mailto'){ // this is a mailto link
				YUrl = baseUrl + 'to=' + encodeURIComponent(linkSplit[1]);
			} else {	// this is not a mailto link
				// Share link
				console.log('What do to with this: '+menuInfo.linkUrl+'; text:'+menuInfo.linkText);
				YUrl = baseUrl + 'subject=Sharing%20a%20link' + '&body=Link:%20' + encodeURIComponent(menuInfo.linkUrl) + 
						' \n\n(From) ' + encodeURIComponent(currTab.url);
			}
			break;
		case 'yahoomail_page':
			// this is Email Link for the page
			YUrl = baseUrl + 'subject=' + encodeURIComponent(currTab.title) + '&body=Link:%20' + encodeURIComponent(currTab.url);
			break;
		case 'yahoomail_selection':
			YUrl = baseUrl;
			// This could be selected on a link... Try to find an address
			if (menuInfo.linkUrl){
				var linkSplit = menuInfo.linkUrl.split(':');
				if (linkSplit[0].toLowerCase() === 'mailto'){ // this is a mailto link
					YUrl += 'to=' + encodeURIComponent(linkSplit[1]) + '&';
				}
			}
			// this is Email Link for the page when text is selected
			var seltext = menuInfo.selectionText;
			seltext = seltext.replace(/^\s*$/,'').replace(/\r/g,'\r').replace(/\n/g,'\n').replace(/^\s+|\s+$/g,' ');
			seltext = ' \n\n(Selection) ' + seltext.replace(new RegExp(/\u2019/g),'\'').replace(new RegExp(/\u201A/g),',').replace(new RegExp(/\u201B/g),'\'');
			YUrl += 'subject=' + encodeURIComponent(currTab.title) + '&body=Link:%20' + encodeURIComponent(currTab.url) +
					encodeURIComponent(seltext);
			break;
		default:
			// WTF?
	}
	if (YUrl.length > 0){
		browser.tabs.create({
			url: YUrl,
			active: true
		}).then((newTab) => {
			/* No action */;
		}).catch((err) => {
			console.log('Error in tabs.create with "' + YUrl + '": ' + err.message);
		});
	}
});
