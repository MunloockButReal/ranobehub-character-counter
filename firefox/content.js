myStorage = window.localStorage;
// Doing this because stupid site overwriting my css. Why, chrome?
const userAgent = window.navigator.userAgent.toLowerCase();

if (userAgent.indexOf('chrome') > -1 && !!window.chrome) {
	const link = document.createElement('link');
	link.setAttribute('rel', 'stylesheet');
	link.setAttribute('type', 'text/css');
	link.setAttribute('href', chrome.runtime.getURL('styles.css'));
	document.querySelector('head').appendChild(link);
}
console.log(userAgent);
// User-customizable settings
let readingSpeed = 180;
let bookmarkBackgroundColor;
let bookmarkTextColor;

//
//
//

// Function to count characters in a text
function countCharacters(text) {
	const charactersWithSpaces = text.length;
	const charactersWithoutSpaces = text.replace(/\s/g, '').length;
	const words = charactersWithSpaces !== 0 ? text.trim().split(/\s+/).length : 0;
	return {
		charactersWithSpaces,
		charactersWithoutSpaces,
		words,
	};
}

// Function to count images in a chapter
function countImages(chapterElement) {
	const imageElements = chapterElement.querySelectorAll('img');
	return imageElements.length;
}

// Function to update chapter title with character count, image count, and word count
function updateChapterTitle(chapterElement) {
	const chapterTitleElement = chapterElement.querySelector('h1.ui.header');
	let chapterID;
	if (chapterTitleElement) chapterID = chapterTitleElement.getAttribute('data-id');

	if (chapterTitleElement) {
		const chapterText = chapterTitleElement.innerText;
		const chapterAllP = chapterElement.querySelectorAll('p');
		const chapterContent = Array.from(chapterAllP)
			.map((p) => p.textContent)
			.join(' ');

		// Adding P bookmark
		let prevElement = null;
		let pBookmark = JSON.parse(myStorage.getItem('pBookmark')) || {};
		let url = window.location.href.split('/').slice(-3);

		console.log(pBookmark);
		if (typeof pBookmark[chapterID] == 'number') {
			p = chapterAllP[pBookmark[chapterID]];
			$(p).addClass('paragraph-bookmark');
			prevElement = p;
		}

		chapterAllP.forEach((p) => {
			// $(p).append($(document.createElement('div')).addClass('paragraph-bookmark2'));

			// $(p).on('click', () => {
			$(p).on('click', () => {
				// $(p).on('click', '.paragraph-bookmark2', () => {
				console.log(p);
				pBookmark[chapterID] = Array.from(chapterAllP).indexOf(p);

				if (prevElement !== null) {
					$(prevElement).removeClass('paragraph-bookmark');
				}
				$(p).addClass('paragraph-bookmark');

				if (prevElement !== null && prevElement == p) {
					$(prevElement).removeClass('paragraph-bookmark');
					prevElement = null;
					delete pBookmark[chapterID];
				} else prevElement = p;

				myStorage.setItem('pBookmark', JSON.stringify(pBookmark));
			});
		});

		// End of P Bookmark

		const { charactersWithSpaces, charactersWithoutSpaces, words } = countCharacters(chapterContent.trim());

		const readingSpeedValue = Math.round(words / readingSpeed).toString();
		const readingSpeedFormat =
			readingSpeedValue +
			(readingSpeedValue[readingSpeedValue.length - 1] == 1
				? ' минуту'
				: readingSpeedValue[readingSpeedValue.length - 1] == 2
				? ' минуты'
				: ' минут');
		const imagesCount = countImages(chapterElement);
		const countText = `Символов: ${charactersWithSpaces}, Символов без пробелов: ${charactersWithoutSpaces}, Слов: ${words}, Картинок: ${imagesCount}. 
		<br> Примерное время чтения: ${readingSpeedFormat} </br>`;
		chapterTitleElement.innerHTML = `${chapterText}<br><span style="font-size: 12px; color: #d4d4d4">${countText}</span>`;
	}
}

// Function to handle the mutation observer
function handleMutations(mutationsList, observer) {
	mutationsList.forEach((mutation) => {
		const addedNodes = Array.from(mutation.addedNodes);
		addedNodes.forEach((addedNode) => {
			if (addedNode.nodeType === Node.ELEMENT_NODE) {
				const chapterElements = Array.from(addedNode.querySelectorAll('.ui.text.container'));
				chapterElements.forEach((chapterElement) => updateChapterTitle(chapterElement));
			}
		});
	});
}

// Initialize the mutation observer for chapter elements
function initializeContentScript() {
	const chapterElements = Array.from(document.querySelectorAll('.ui.text.container'));
	chapterElements.forEach((chapterElement) => updateChapterTitle(chapterElement));

	const appContainer = document.getElementById('app');
	if (appContainer) {
		const observer = new MutationObserver(handleMutations);
		observer.observe(appContainer, { childList: true, subtree: true });
	}
}

function replaceTotalSymbols() {
	let pcElement = $('.book-meta-value.book-stats');
	let pcChapterElement = pcElement.find('strong');
	let pcAuthorSheetsElement = pcElement.find('i.question.outline.circle.icon.__tooltip');
	let pcOriginalBookElement = pcElement.find('.book-stats__original');

	let mobileElement = $('#section-information');
	let mobileBookNotes = mobileElement.find('.book-notes').find('p');
	let mobileLinks = mobileElement.find('.ui.small.feed.ranobe-links');

	let chapters = pcChapterElement.text().trim();
	let authorSheetsData = pcAuthorSheetsElement.attr('data-tippy-content');
	let authorSheets = (authorSheetsData.match(/\d+/g) || [0])[1]; // Extracts the second number from the string or default to 0

	let totalSymbols = authorSheets * 40000;
	let totalSymbolsM = (totalSymbols / 1000000).toFixed(2);
	let averageSymbols = Math.floor(totalSymbols / chapters);

	pcElement
		.html(
			`<p><strong>${chapters}</strong> глав на русском</p>
	  <p style="font-size: 12px; color: whitesmoke"><strong>${totalSymbolsM}M</strong> знаков, <strong>${authorSheets}</strong> авторских листов, (${averageSymbols} в среднем)</p>`
		)
		.append(pcOriginalBookElement);

	let mobileTranslated = $(
		`<p><strong>Переведено:</strong> ${chapters} глав; ${totalSymbolsM}M зн. ${authorSheets} а.л., (${averageSymbols} в среднем)</p>`
	);

	let mobileOriginal = mobileElement.find('p:contains("В оригинале")');
	let mLinks = $('<strong>Ссылки:</strong>').append(mobileLinks);

	mobileElement.empty().append(mobileBookNotes, mobileTranslated, mobileOriginal, mLinks);
}

// Checking if the current page is a chapter page
let urlPatternChapter = /ranobehub.org\/ranobe\/\d+\/\d+\/\d+/;

if (urlPatternChapter.test(window.location.href)) {
	initializeContentScript();
}

// Checking if the current page is a book page
let urlPatternBookPage = /\/ranobehub.org\/ranobe\/\d+-\w+/;

if (urlPatternBookPage.test(window.location.href)) {
	replaceTotalSymbols();
}

//
//
//

/* 
function apiText(chapterID) {
	let returnData = '';
	fetch(`https://ranobehub.org/api/chapter/${chapterID}`)
	.then((responce) => responce.json())
	.then((data) => {
		returnData = data.chapter.text.replace(new RegExp(`<.*?>`, 'g'), '');
	});
	return returnData;
}

console.log(apiText(30044));
 */

// browserName = (function (agent) {        switch (true) {
// 	case agent.indexOf("edge") > -1: return "MS Edge";
// 	case agent.indexOf("edg/") > -1: return "Edge ( chromium based)";
// 	case agent.indexOf("opr") > -1 && !!window.opr: return "Opera";
// 	case agent.indexOf("chrome") > -1 && !!window.chrome: return "Chrome";
// 	case agent.indexOf("trident") > -1: return "MS IE";
// 	case agent.indexOf("firefox") > -1: return "Mozilla Firefox";
// 	case agent.indexOf("safari") > -1: return "Safari";
// 	default: return "other";
// }
// })(window.navigator.userAgent.toLowerCase());

// console.log(browserName)
