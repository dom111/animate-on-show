/**
 * jQuery.animateOnShow 0.1
 *
 * A basic toolkit for allowing CSS aniamtions to be triggered when you scroll
 * to the element. It's not really intended as a ready to use plugin, although
 * there are examples included. I wanted to use this functionality but be able
 * to define the animations myself. Since it relies on CSS animations it won't
 * work in IE8. It does require jQuery but should work with almost any version.
 *
 * Free to use however you like since there's not really much here...
 */
(function($) {
    $.AnimateOnShow = {
        settings: {
            delay: 0, // global delay in ms before running applying the apply class, added to the elements delay attribute
            adjust: 0, // adjust all height calculations globally by this many pixels, also added to the elements adjust attribute
            custom: {
                // these can be used to adjust positioning, like with the example
                // slide-in-from-below, the calculation needs to take the initial
                // translate into consideration and so we add the 400 which is
                // missing due to the initial state.
                'slide-in-from-below': 400,
                'slide-in-from-above': -400
            }
        },
        disabled: false // globally disable - used in case you want to scroll and not fire events
    },
    // probably not necessary but why not...
    onOrBind =('on' in $()) ? 'on' : 'bind',
    propOrAttr = ('prop' in $()) ? 'prop' : 'attr',
    window = window;

    $(function() {
        var settings = $.AnimateOnShow.settings;

        $(document).trigger('animateOnShow.init');

        // should we rate limit this?
        $(window)[onOrBind]('scroll load', function() {
            if ($.AnimateOnShow.disabled) {
                // this exists in case you want to add a reset button or
                // something, you could disable all animations, scroll to the
                // top and then re-enable and trigger a custom event to
                // reprocess...
                return;
            }

            $(settings.selector || ('.animate-on-show:not(.animated)')).filter(function() {
                var bottom = ($(window).scrollTop() + $(window).height()),
                $el = $(this);

                if ($el.hasClass('force-animate')) {
                    return true;
                }

                bottom -= (+($(this).attr('data-animate-adjust') || 0) + settings.adjust);

                // adjust for translated heights
                $.each(settings.custom, function(key, value) {
                    if ($el.hasClass(key)) {
                        bottom += value;
                    }
                });

                return $el.offset().top <= bottom;
            }).each(function() {
                var $el = $(this),
                link = $el.attr('data-animate-chain'),
                animate = function($el) {
                    var delay = (+($el.attr('data-animate-delay') || 0) + settings.delay),
                    apply = (function($el) {
                        return function() {
                            $el
                                .removeData('animatedOnShow.timeout') // this probably isn't necessary, but nice to clean up
                                .addClass('animted') // the actual animation trigger
                                .trigger('animatedOnShow.show'); // in case we want to trigger anything on show
                        };
                    })($el);

                    if (delay) {
                        $el.data('aniamtedOnShow.timeout', setTimeout(apply, delay));
                    }
                    else {
                        apply();
                    }
                };

                if ($el.hasClass('animated')) {
                    return;
                }

                if (link) {
                    $('[data-animate-chain="' + link + '"]').each(function() {
                        animate($(this));
                    });
                }
                else {
                    animate($el);
                }
            });
        });
    });
})(jQuery);
