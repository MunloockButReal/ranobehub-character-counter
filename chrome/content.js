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
	if (chapterTitleElement) {
		const chapterText = chapterTitleElement.innerText;
		const chapterContent = Array.from(chapterElement.querySelectorAll('p'))
			.map((p) => p.textContent)
			.join(' ');
		const { charactersWithSpaces, charactersWithoutSpaces, words } = countCharacters(chapterContent.trim());
		const imagesCount = countImages(chapterElement);
		const countText = `Символов: ${charactersWithSpaces}, Символов без пробелов: ${charactersWithoutSpaces}, Слов: ${words}, Картинок: ${imagesCount}`;
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

// Check if the page URL matches the specified domain
if (window.location.href.includes('ranobehub.org/ranobe/')) {
	initializeContentScript();
}

//
//
//
//
//

// function apiText(chapterID) {
// 	let returnData = '';
// 	fetch(`https://ranobehub.org/api/chapter/${chapterID}`)
// 	.then((responce) => responce.json())
// 	.then((data) => {
// 		returnData = data.chapter.text.replace(new RegExp(`<.*?>`, 'g'), '');
// 	});
// 	return returnData;
// }

// console.log(apiText(30044));

/* 
$().ready(function () {


	//
	//
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
		const imageElements = chapterElement.find('img');
		return imageElements.length;
	}

	// Function to update chapter title with character count, image count, and word count
	function updateChapterTitle(chapterElement) {
		const chapterTitleElement = chapterElement.find('h1.ui.header');
		if (chapterTitleElement.length) {
			const chapterText = chapterTitleElement.text();
			const chapterContainer = chapterElement.data('container');
			console.log(chapterContainer);
			const apiUrl = `https://ranobehub.org/api/chapter/${chapterContainer}`;

			// Fetch the chapter content from the API
			$.get(apiUrl)
				.done((chapterContent) => {
					const { charactersWithSpaces, charactersWithoutSpaces, words } = countCharacters(
						chapterContent.chapter.text.replace(new RegExp(`<.*?>`, 'g'), '').trim()
					);
					const imagesCount = countImages(chapterElement);
					const countText = `Символов: ${charactersWithSpaces}, Символов без пробелов: ${charactersWithoutSpaces}, Слов: ${words}, Картинок: ${imagesCount}`;
					chapterTitleElement.html(
						`${chapterText}<br><span style="font-size: 12px; color: #d4d4d4">${countText}</span>`
					);
					console.log(chapterContent.chapter.name, countText, chapterContent.chapter.text.slice(0, 100));
					console.log(chapterContent.chapter.text.replace(new RegExp(`<.*?>`, 'g'), '').trim().length);
				})
				.fail((error) => {
					console.error('Failed to fetch chapter content:', error);
				});
		}
	}

	// Function to handle the mutation observer
	function handleMutations(mutationsList, observer) {
		mutationsList.forEach((mutation) => {
			const addedNodes = Array.from(mutation.addedNodes);
			addedNodes.forEach((addedNode) => {
				if (addedNode.nodeType === Node.ELEMENT_NODE) {
					const chapterElements = $(addedNode).find('.ui.text.container');
					chapterElements.each((_, chapterElement) => {
						updateChapterTitle($(chapterElement));
					});
				}
			});
		});
	}

	// Initialize the mutation observer for chapter elements
	function initializeContentScript() {
		const chapterElements = $('.ui.text.container');
		chapterElements.each((_, chapterElement) => {
			updateChapterTitle($(chapterElement));
		});

		const appContainer = $('#app');
		if (appContainer.length) {
			const observer = new MutationObserver(handleMutations);
			observer.observe(appContainer[0], { childList: true, subtree: true });
		}
	}

	// Check if the page URL matches the specified domain
	if (window.location.href.includes('ranobehub.org/ranobe/')) {
		initializeContentScript();
	}
}); */
