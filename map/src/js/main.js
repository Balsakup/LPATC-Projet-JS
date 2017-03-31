var Point = function(label, lat, lng, cat) {
    this.label = label
    this.lat   = lat
    this.lng   = lng
    this.cat   = cat
}

var map           = null
var pointsList    = {}

var initMap = function() {
    console.log('Map initialized !')

    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 49.186630,
            lng: -0.362903
        },
        zoom: 12
    })
}

var getSeed = function() {
    var chars = 'ABCDEFGHIKJLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var res   = ''

    for (var i = 0; i < 10; i++) {
        res += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    return res
}

var addPoint = function(point, seed) {
    if (point instanceof Point || point.label && point.lat && point.lng && point.cat) {
        var icon = {
            url: '../img/' + point.cat + '.png',
            size: new google.maps.Size(85, 122),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(25 / 2, 25 / 85 * 122),
            scaledSize: new google.maps.Size(25, 25 / 85 * 122) // pour garder un bon ratio
        }

        var info = new google.maps.InfoWindow({
            content: point.label
        })

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(point.lat, point.lng),
            title: point.label,
            map: map,
            icon: new google.maps.Marker(icon)
        })
        marker.addListener('click', function() {
            info.open(map, marker)
        })

        pointsList[seed]       = marker
        pointsList[seed].point = point
    }
}

jQuery(document).ready(function() {

    var body        = $('body')
    var drag        = $('.drag')

    var categories  = $('.categories')
    var points      = categories.find('.category__content li')

    var modalAdd    = $('.modal.add')
    var modalImport = $('.modal.import')
    var btnAdd      = $('.btn.btn-add')
    var btnExport   = $('.btn.btn-export')
    var btnImport   = $('.btn.btn-import')

    categories.find('.category .category__title').on('click', function(event) {
        event.preventDefault()

        var elem    = $(this)
        var content = elem.siblings('.category__content')

        if (content.is(':visible')) {
            content.slideUp()
        } else {
            elem.siblings('.category__content').slideDown()
        }

        elem.parent('.category').siblings('.category').find('.category__content').slideUp()
    })

    categories.on('click', '.category__content li', function(event) {
        event.preventDefault()

        var elem    = $(this)
        var visible = JSON.parse(elem.attr('data-visible'))

        if (visible) {
            elem.attr('data-visible', false)
        } else {
            elem.attr('data-visible', true)
        }

        pointsList[elem.data('seed')].setVisible(!visible)
    })

    categories.find('.category__title').each(function(index, category) {
        category = $(category)

        var label = $('<label />', {
            text: category.text()
        })
        var input = $('<input />', {
            type : 'checkbox',
            name : 'categories',
            value: category.data('id')
        })

        label.prepend(input).appendTo(modalAdd.find('.form__checkboxes'))
    })

    btnAdd.on('click', function(event) {
        event.preventDefault()

        modalAdd.fadeIn()
    })

    btnExport.on('click', function(event) {
        event.preventDefault()

        var content = {}

        for (var i in pointsList) {
            content[i] = pointsList[i].point
        }

        var elem = document.createElement('a')
        elem.setAttribute('href', 'data:application/json;charset=utf-8,' + JSON.stringify(content))
        elem.setAttribute('download', 'points_' + getSeed() + '.json') // Pour avoir un fichier unique à chaque exportation
        elem.style.display = 'none'

        document.body.appendChild(elem)

        elem.click()

        document.body.removeChild(elem)
    })

    btnImport.on('click', function(event) {
        modalImport.fadeIn()

        event.preventDefault()
    })

    $('.modal__close').on('click', function(event) {
        event.preventDefault()

        $(this).parents('.modal').fadeOut()
    })

    modalAdd.find('.form.form-add').on('submit', function(event) {
        event.preventDefault()

        var form   = $(this)
        var label  = form.find('input[name="label"]')[0]
        var lat    = form.find('input[name="lat"]')[0]
        var lng    = form.find('input[name="lng"]')[0]
        var cat    = form.find('input[name="categories"]')
        var hasCat = false

        cat.each(function(index, input) {
            hasCat = hasCat || input.checked
        })

        if (label.value != '' &&
            new RegExp(/^[+-]?([0-9]*[.])?[0-9]+$/g).test(lat.value) &&
            new RegExp(/^[+-]?([0-9]*[.])?[0-9]+$/g).test(lng.value) &&
            hasCat
        ) {
            cat.each(function(index, input) {
                if (input.checked) {
                    var seed  = getSeed()
                    var point = new Point(label.value, lat.value, lng.value, input.value)

                    categories
                        .find('[data-id="' + input.value + '"]')
                        .siblings('.category__content')
                        .append($('<li />', {
                            text: label.value,
                            'data-visible': true,
                            'data-seed': seed
                        }))

                    addPoint(point, seed)
                }

                input.checked = false
            })

            modalAdd.fadeOut()
            label.value = ''
            lat.value   = ''
            lng.value   = ''
        } else {
            console.log('PAS BON')
        }
    })

    body.on('dragstart', function(event) {
        event.preventDefault()

        event.originalEvent.dataTransfer.setData('text', $(this).text())
    })

    body.on('dragenter', function(event) {
        event.preventDefault()

        drag.fadeIn()
    })

    body.on('dragover', function(event) {
        event.preventDefault()
    })

    body.on('drop', function(event) {
        event.preventDefault()

        var files = event.originalEvent.dataTransfer.files

        for (var i in files) {
            var file = files[i]

            if (file.type != undefined && file.type.indexOf('application/json') === 0) {
                var reader = new FileReader
                reader.onload = function(event) {
                    var points = JSON.parse(event.target.result)

                    for (var i in points) {
                        var point = points[i]

                        if (categories.find('[data-seed="' + i + '"]').length === 0) {
                            categories
                                .find('[data-id="' + point.cat + '"]')
                                .siblings('.category__content')
                                .append($('<li />', {
                                    text: point.label,
                                    'data-visible': true,
                                    'data-seed': i
                                }))

                            addPoint(point, i)
                        }
                    }
                }
                reader.readAsText(file)
            }
        }

        drag.fadeOut()
    })
})
