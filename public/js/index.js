let select = document.getElementById('limit');
let form = document.getElementById('search-form');
let searchInput = document.getElementById('search');

// select.addEventListener('change', function () {
//     form.submit();
// });

form.addEventListener('submit', (e) => {
    e.preventDefault();
    let append = '';

    if (limit != 20) {
        if (append) {
            append += '&';
        }
        append += 'l=' + limit;
    }

    if (searchInput.value) {
        if (append) {
            append += '&';
        }
        append += 'q=' + searchInput.value;
    }

    if (append) {
        append = '?' + append;
    }
    window.location.replace(window.location.origin + '/singles' + append);
});

select.addEventListener('change', () => {
    let append = '';
    console.log('append: ' + append);

    if (page > 1) {
        append += 'p=' + page;
    }
    console.log('append: ' + append);

    let newLimit = select.value;

    if (newLimit != 20) {
        if (append) {
            append += '&';
        }
        append += 'l=' + newLimit;
    }
    console.log('append: ' + append);

    if (search) {
        if (append) {
            append += '&';
        }
        append += 'q=' + searchInput.value;
    }

    if (append) {
        append = '?' + append;
    }
    window.location.replace(window.location.origin + '/singles' + append);
});

function nextPage() {
    let append = 'p=' + (page + 1);

    if (limit != 20) {
        if (append) {
            append += '&';
        }
        append += 'l=' + limit;
    }

    if (search) {
        if (append) {
            append += '&';
        }
        append += 'q=' + searchInput.value;
    }

    if (append) {
        append = '?' + append;
    }
    window.location.replace(window.location.origin + '/singles' + append);
}

function prevPage() {
    let append = '';
    if (page > 2) {
        append = 'p=' + (page - 1);
    }

    if (limit != 20) {
        if (append) {
            append += '&';
        }
        append += 'l=' + limit;
    }

    if (search) {
        if (append) {
            append += '&';
        }
        append += 'q=' + searchInput.value;
    }

    if (append) {
        append = '?' + append;
    }
    window.location.replace(window.location.origin + '/singles' + append);
}
