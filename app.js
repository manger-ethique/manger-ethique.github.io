const request = {
    url: 'https://api.github.com/gists/',
    gistid: '5a5f8e0bd7caab45aa811d4616a846bd',
    filename: 'list.json',
    ajax: () => {
        return new Promise((resolve) => {
            $.ajax({
                url: request.url + request.gistid,
                type: 'GET',
                dataType: 'jsonp',
            }).done((gistdata) => {
                const content = gistdata.data.files[request.filename].content;
                storage.set(content);
                resolve(content);
            })
        })
    }
}

const storage = {
    listItem: 'list',
    cacheKey: 'cacheKey',
    check: () => {
        let cacheKey = localStorage.getItem(storage.cacheKey);
        if (cacheKey) {
            const now = new Date;
            if (now.toLocaleDateString('fr-FR') !== cacheKey) {
                cacheKey = null;
            }
        }
        return cacheKey;
    },
    set: (content) => {
        const now = new Date;
        localStorage.setItem(storage.listItem, content);
        localStorage.setItem(storage.cacheKey, now.toLocaleDateString('fr-FR'));
    }
}

const search = {
    input: null,
    list: null,
    country: null,
    validator: /\s|\./g,
    getResult: (list, value) => {
        return _.filter(list, (item) => {
            const code = item.code.replaceAll(search.validator, '');
            return code.includes(value);
        });
    },
    buildHtml: (result) => {
        let html = '';
        if (result.length > 0) {
            result.forEach((element) => {
                html += `<li>
                <span class="name">
                    <span class="code">${element.code}</span> <em>-</em> 
                    <span class="place">${element.place}</span>
                </span>
                <span class="type">
                    <span class="${(!element.bovins) ? 'disabled' : ''}">B</span>
                    <span class="${(!element.veaux) ? 'disabled' : ''}" >V</span>
                    <span class="${(!element.ovins) ? 'disabled' : ''}">0</span>
                    <span class="${(!element.caprins) ? 'disabled' : ''}">C</span>
                </span>
                </li>`
            });
        } else {
            html += `<li>Votre saisie ne correspond à aucun abattoir connu ayant recours à l'étourdissement.</li>`
        }

        return html;
    },
    display: () => {
        let value = (search.country + search.input.val()).replaceAll(search.validator, '');
        let html = '';

        if (value !== search.country) {
            html = search.buildHtml(search.getResult(search.list, value));
        }
        return html;
    },
    init: (list) => {
        search.list = list;
        search.country = $('#country').val();

        $('#code').on('input', (event) => {
            search.input = $(event.currentTarget);
            $('#result').html(search.display());
        });
    }
}

$(document).ready(() => {
    const timer = storage.check();
    if (!timer) {
        request.ajax().then((data) => {
            search.init(JSON.parse(data));
        })
    } else {
        search.init(JSON.parse(localStorage.getItem(storage.listItem)));
    }

    $('.trigger').on('click', () => {
        $('.info').toggleClass('open');
    })
})
