(function($) {

    $(document).ready(function() {

        /*-------------------------------------------------------------

            Gestion des images

        --------------------------------------------------------------*/
        var product_main_image  = $('#product-main-image')
        var product_images_list = $('#product-images-list')

        product_images_list.find('img').on('click', function() {
            product_main_image.attr('src', $(this).attr('src'))
        })

        /*-------------------------------------------------------------

            Gestion du panier

        --------------------------------------------------------------*/
        var cart_item_number = $('#cart-item-number')
        var add_to_cart      = $('#add-to-cart')

        add_to_cart.on('click', function(event) {
            event.preventDefault()

            cart_item_number.text(parseInt(cart_item_number.text()) + 1)
        })

        /*-------------------------------------------------------------

            Gestion des caractéristiques

        --------------------------------------------------------------*/
        var color         = $('.product-feature.attr')
        var storage       = $('.product-feature.attr2')
        var amountMinus   = $('.input-group-addon.quantity-minus')
        var amountPlus    = $('.input-group-addon.quantity-plus')
        var amount        = $('#exampleInputAmount').first()
        var product_price = $('#product-price')
        var base_price    = parseInt(product_price.text())
        var calculPrice   = function() {
            var nb    = parseInt(amount.val()) || 1
            var count = {
                color  : nb * color.filter('.active').data('price') || 0,
                storage: nb * storage.filter('.active').data('price') || 0,
                amount : (nb - 1) * amount.data('price')
            }

            product_price.text(base_price + count.color + count.storage + count.amount)
        }

        $(document).on('click', color.selector + ', ' + storage.selector, function(event) {
            var elem = $(event.target)

            elem.addClass('active').siblings().removeClass('active')
            calculPrice()
        })

        amountMinus.on('click', function() {
            if (parseInt(amount.val()) > 1) {
                amount.val(parseInt(amount.val()) - 1)
                calculPrice()
            }
        })

        amountPlus.on('click', function() {
            amount.val(parseInt(amount.val()) + 1)
            calculPrice()
        })

        /*-------------------------------------------------------------

            Description du produit

        --------------------------------------------------------------*/
        var panels_container = $('#panels-container')

        panels_container.find('.menu-items li').on('click', function() {
            var elem = $(this)
            elem.addClass('active').siblings().removeClass('active')

            panels_container
                .find('section[data-panel="' + elem.data('panel') + '"]')
                .addClass('active')
                .siblings()
                .removeClass('active')
        })

    })

})(jQuery)
