document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'http://localhost:3000/quotes';
    const likesUrl = 'http://localhost:3000/likes';
    const quoteList = document.getElementById('quote-list');
    const quoteForm = document.getElementById('quote-form');
    const authorInput = document.getElementById('author');
    const contentInput = document.getElementById('content');
    const sortToggle = document.getElementById('sort-toggle');
    let isSortedByAuthor = false;

    const fetchQuotes = async () => {
        try {
            const response = await fetch(`${apiUrl}?_embed=likes`);
            const quotes = await response.json();
            if (isSortedByAuthor) {
                quotes.sort((a, b) => a.author.localeCompare(b.author));
            }
            renderQuotes(quotes);
        } catch (error) {
            console.error('Error fetching quotes:', error);
        }
    };

    const renderQuotes = (quotes) => {
        quoteList.innerHTML = '';
        quotes.forEach(quote => {
            const li = document.createElement('li');
            li.className = 'quote-card';
            li.dataset.id = quote.id;

            const quoteCard = `
                <blockquote class="blockquote">
                    <p class="mb-0">${quote.content}</p>
                    <footer class="blockquote-footer">${quote.author}</footer>
                    <br>
                    <button class='btn-success' onclick="likeQuote(${quote.id})">Likes: <span>${quote.likes.length}</span></button>
                    <button class='btn-danger' onclick="deleteQuote(${quote.id})">Delete</button>
                    <button class='btn-primary' onclick="showEditForm(${quote.id})">Edit</button>
                </blockquote>
            `;
            li.innerHTML = quoteCard;
            quoteList.appendChild(li);
        });
    };

    const addQuote = async (quote) => {
        try {
            await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(quote),
            });
            fetchQuotes();
        } catch (error) {
            console.error('Error adding quote:', error);
        }
    };

    const deleteQuote = async (id) => {
        try {
            await fetch(`${apiUrl}/${id}`, {
                method: 'DELETE',
            });
            fetchQuotes();
        } catch (error) {
            console.error('Error deleting quote:', error);
        }
    };

    const likeQuote = async (quoteId) => {
        try {
            await fetch(likesUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quoteId }),
            });
            fetchQuotes();
        } catch (error) {
            console.error('Error liking quote:', error);
        }
    };

    const showEditForm = (id) => {
        const quoteCard = document.querySelector(`.quote-card[data-id='${id}']`);
        const content = quoteCard.querySelector('p').textContent;
        const author = quoteCard.querySelector('footer').textContent;
        authorInput.value = author;
        contentInput.value = content;

        quoteForm.onsubmit = (e) => {
            e.preventDefault();
            updateQuote(id);
        };
    };

    const updateQuote = async (id) => {
        try {
            await fetch(`${apiUrl}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    author: authorInput.value,
                    content: contentInput.value,
                }),
            });
            fetchQuotes();
        } catch (error) {
            console.error('Error updating quote:', error);
        }
    };

    sortToggle.addEventListener('click', () => {
        isSortedByAuthor = !isSortedByAuthor;
        sortToggle.textContent = isSortedByAuthor ? 'Sort by ID' : 'Sort by Author';
        fetchQuotes();
    });

    quoteForm.onsubmit = (e) => {
        e.preventDefault();
        addQuote({
            author: authorInput.value,
            content: contentInput.value,
        });
        authorInput.value = '';
        contentInput.value = '';
    };

    fetchQuotes();
});
