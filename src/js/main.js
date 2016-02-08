var ist = (function() {
    var __debug__ = false;
    var scrollspy_href = null;
    
    function isFilterOneMode() {
        // if no such element exists return always true
        var $btn = $('#btn-filter-one');
        return $btn.length ? $btn.is(':checked') : true;
    };

    function getVisibleElements() {
        return $('#input-reference>.main-section:visible');
    };

    function getHiddenElements() {
        return $('#input-reference>.main-section:hidden');
    };
    
    function getActiveElement() {
        if ($(window).scrollTop() <= 50)
            return null;
        
        var elements = getVisibleElements();
        var $element = null;
        elements.each(function(index, element) {
            if ($(element).startInView()) {
                $element = $(element);
                return false;
            }
        });
        return $element;
    };

    function disableBtnGroup(state) {
        if (state)
            $('.filter-btns a').hide();
        else
            $('.filter-btns a').show();
    };

    function getGroupStates() {
        var result = {
            'visible': [],
            'hidden': []
        };
        $(".btn-filter").each(function(index, element) {
            $(element).hasClass('active') ? result['visible'].push($(element).data('type')) : result['hidden'].push($(element).data('type'))
        });

        return result;
    };

    function getURLElement() {
        if (!window.location.hash)
            return null;

        var hash = window.location.hash;
        return $(hash).hasClass('main-section') ? $(hash) : null;
    };

    $(window).on('hashchange', function(e) {
        if (__debug__) console.log('hashchange');
        var urlElement = getURLElement();
        if (isFilterOneMode()) {
            if (urlElement) {
                getVisibleElements().addClass('hidden');
                urlElement.removeClass('hidden');
            }
        } else {
            // we need to make sure that focused element which are
            // hidden will still be focused
            if (urlElement)
                urlElement.removeClass('hidden');
        }

        if (urlElement)
            setTimeout(function() {
                $(document.body).scrollTop(urlElement.offset().top);
            }, 1);
    });

    $(document).on('mode-changed', function() {
        if (__debug__) console.log('mode-changed');
        var singleMode = isFilterOneMode();
        disableBtnGroup(singleMode);
        if (singleMode) {
            
            if (scrollspy_href) {
                scrollspy_href.removeClass('active');
                scrollspy_href = null;
            }
            
            $visible = getVisibleElements();
            var urlElement = getURLElement();

            if ($visible.length == 0) {
                if (urlElement) {
                    urlElement.removeClass('hidden');
                } else {
                    $hidden = getHiddenElements();
                    $hidden.first().removeClass('hidden');
                }
            }

            if ($visible.length > 1) {
                $visible.addClass('hidden');
                if (urlElement) {
                    urlElement.removeClass('hidden');
                } else {
                    $visible.first().removeClass('hidden');
                }
            }
        } else {
            $(document).trigger('filter-changed');
        }
    });

    $(document).on('filter-changed', function() {
        if (__debug__) console.log('filter-changed');
        var groupStates = getGroupStates();
        if (groupStates['visible'].length == 0) {
            $(".btn-filter").first().addClass('active');
            groupStates = getGroupStates();
        }

        groupStates['visible'].forEach(function(element, index) {
            $('#input-reference>.' + element).removeClass('hidden');
        });
        groupStates['hidden'].forEach(function(element, index) {
            $('#input-reference>.' + element).addClass('hidden');
        });
    });

    $(document).on('scroll-changed', function() {
        if (__debug__) console.log('scroll-changed');
        if ($(window).scrollTop() > $('#input-reference').offset().top) {
            $('#top-link-block').css('left', $('#input-reference').width() + $('#input-reference').offset().left);
            $('#top-link-block').show();
        } else {
            $('#top-link-block').hide();
        }
        var parentTop = $('.tree-list').parent().offset().top;
        var bodyScroll = $(document.body).scrollTop();
        $('.tree-list').css({
            'top': Math.max(bodyScroll - parentTop, 0) + 'px'
        });
        
        // scrollspy works only with tree ordered items
        // and only in multiple mode
        if (!isFilterOneMode()) {
            var $tv = $('#tree-view')
            if ($tv.hasClass('active')) {
                var perc = $(window).scrollTop()/$(document).height();
                var scroll = perc * $tv[0].scrollHeight;
                var hei = $tv.height();
                scroll = Math.max(scroll - hei/2, 0);
                $tv.scrollTop(scroll);
            }
        }
        
        var active = getActiveElement();
        if (active && active != scrollspy_href) {
            if (scrollspy_href) {
                scrollspy_href.removeClass('active');
                scrollspy_href = null;
            }
            scrollspy_href = $('.active ._'+active.attr('id'))
            scrollspy_href.addClass('active');
            // location.hash = 'item-'+active.attr('id');
        }
    });

    $(document).on('dimension-changed', function() {
        if (__debug__) console.log('dimension-changed');
        $('.tab-pane').css({
            'max-height': ($(window).height() - $('.nav-tabs').height() - 50) + 'px',
            'overflow': 'auto',
        });
        
        $(document).trigger('scroll-changed');
    });

    $(function() {
        $(document).trigger('mode-changed');

        $('.btn-filter').click(function() {
            $(this).toggleClass('active');
            $(document).trigger('filter-changed');
        });

        $('#btn-filter-one').change(function() {
            $(document).trigger('mode-changed');
        });


        $('.nav-tabs a').click(function() {
            var element = $(this).attr('aria-controls');
            $('.tab-content .tab-pane').removeClass('active');
            $('#' + element).addClass('active');
        });

        $('#search').on('input', function() {
            var search = $('#search').val().trim().toLowerCase();
            if (!search)
                return $('.tab-content li').show();

            $('.tab-content li').each(function(index, element) {
                var $element = $(element);
                if ($element.data('name').trim().toLowerCase().indexOf(search) == -1)
                    $element.hide();
                else
                    $element.show();
            });
        });

        // hand over resizing and scrolling
        $(window).resize(function() {
            $(document).trigger('dimension-changed');
        });
        $(window).scroll(function() {
            $(document).trigger('scroll-changed');
        });

        // expanding latex expressions
        var latex = $('.md-expression');
        latex.each(function(index, element) {
            var code = $(element).text();
            if (code.startsWith('{$'))
                code = code.substring(2);

            if (code.endsWith('$}'))
                code = code.substring(0, code.length - 2);

            katex.render(code, element, {
                displayMode: false
            });
        });


        // mobile support
        $('.tree-list').append('<div id="navigation-mobile">' +
            '<select id="navigation-mobile-select"></select>' +
            '</div>');
        var $mobileSelect = $('#navigation-mobile-select');
        $('#abc-view li').each(function(index, element) {
            var option = document.createElement("option");
            option.text = $(element).data('name');
            option.value = $(element).find('a').attr('href');
            $mobileSelect.append(option);
        });
        $mobileSelect.change(function(e) {
            window.location.hash = $mobileSelect.val()
        });

        // in view plugin
        (function($) {
            $.fn.inView = function() {
                var st = (document.documentElement.scrollTop || document.body.scrollTop),
                    ot = $(this).offset().top,
                    wh = (window.innerHeight && window.innerHeight < $(window).height()) ? window.innerHeight : $(window).height();

                return ot > st && ($(this).height() + ot) < (st + wh);
            };
            $.fn.startInView = function() {
                var st = (document.documentElement.scrollTop || document.body.scrollTop),
                    ot = $(this).offset().top,
                    wh = (window.innerHeight && window.innerHeight < $(window).height()) ? window.innerHeight : $(window).height();

                return ot >= st && (ot) <= (st + wh);
            };
        })(jQuery);

        $(document).trigger('hashchange');
        $(document).trigger('dimension-changed');
    });
    return {
        isFilterOneMode: isFilterOneMode,
        getVisibleElements: getVisibleElements,
        getHiddenElements: getHiddenElements,
        getURLElement: getURLElement,
        getGroupStates: getGroupStates,
        getActiveElement: getActiveElement,
    }
}());