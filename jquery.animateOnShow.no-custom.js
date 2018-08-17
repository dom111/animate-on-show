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
            selector: '', // defaults to '.{settings.classes.source}:not({settings.classes.apply})
            // you can change these here to suit whatever classes you have in your page already
            classes: {
                source: 'animate-on-show', // class applied to elements to animate
                apply: 'animated', // class that applies the animation
                force: 'force-animate' // class to force animation (even if not on screen)
            },
            events: {
                // events on which to check for changes, could add a custom event here if wanted
                fire: 'scroll load',
                // custom events
                namespace: 'animateOnShow.',
                init: 'init', // fired when the script is initialising
                show: 'show' // fired when an element has the apply class... applied...
            },
            delay: 0, // global delay in ms before running applying the apply class, added to the elements delay attribute
            adjust: 0, // adjust all height calculations globally by this many pixels, also added to the elements adjust attribute
            // attributes for greater control
            attr: {
                adjust: 'data-animate-adjust',
                chain: 'data-animate-chain',
                delay: 'data-animate-delay'
            },
            custom: {
                // these can be used to adjust positioning, like with the example
                // slide-in-from-below, the calculation needs to take the initial
                // translate into consideration and so we add the 400 which is
                // missing due to the initial state.
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

        $(document).trigger(settings.events.namespace + settings.events.init);

        // should we rate limit this?
        $(window)[onOrBind](settings.events.fire, function() {
            if ($.AnimateOnShow.disabled) {
                // this exists in case you want to add a reset button or
                // something, you could disable all animations, scroll to the
                // top and then re-enable and trigger a custom event to
                // reprocess...
                return;
            }

            $(settings.selector || ('.' + settings.classes.source + ':not(.' + settings.classes.apply + ')')).filter(function() {
                var bottom = ($(window).scrollTop() + $(window).height()),
                $el = $(this);

                if ($el.hasClass(settings.classes.force)) {
                    return true;
                }

                bottom -= (+($(this).attr(settings.attr.adjust) || 0) + settings.adjust);

                // adjust for translated heights
                $.each(settings.custom, function(key, value) {
                    if ($el.hasClass(key)) {
                        bottom += value;
                    }
                });

                return $el.offset().top <= bottom;
            }).each(function() {
                var $el = $(this),
                link = $el.attr(settings.attr.chain),
                animate = function($el) {
                    var delay = (+($el.attr(settings.attr.delay) || 0) + settings.delay),
                    apply = (function($el) {
                        return function() {
                            $el
                                .removeData(settings.events.namespace + 'timeout') // this probably isn't necessary, but nice to clean up
                                .addClass(settings.classes.apply) // the actual animation trigger
                                .trigger(settings.events.namespace + settings.events.show); // in case we want to trigger anything on show
                        };
                    })($el);

                    if (delay) {
                        $el.data(settings.events.namespace + 'timeout', setTimeout(apply, delay));
                    }
                    else {
                        apply();
                    }
                };

                if ($el.hasClass(settings.classes.apply)) {
                    return;
                }

                if (link) {
                    $('[' + settings.attr.chain + '="' + link + '"]').each(function() {
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
