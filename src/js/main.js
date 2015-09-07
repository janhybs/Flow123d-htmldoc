function isFilterOneMode () {
    // if no such element exists return always true
    var $btn = $('#btn-filter-one');
    return $btn.length ? $btn.is(':checked') : true;
}

function getVisibleElements () {
    return $('#input-reference>.main-section:visible');
}

function getHiddenElements () {
    return $('#input-reference>.main-section:hidden');
}

function disableBtnGroup (state) {
    if (state)
        $('.filter-btns a').hide();
    else
        $('.filter-btns a').show();
}

function getGroupStates () {
    var result = {'visible': [], 'hidden':[]};
    $(".btn-filter").each(function(index, element){
        $(element).hasClass('active') ? result['visible'].push($(element).data('type')) : result['hidden'].push($(element).data('type'))
    });

    return result;
}
$(window).on('hashchange', function(e) {
    var urlElement = getURLElement ();
    if (isFilterOneMode()) {
        if (urlElement) {
            getVisibleElements().addClass ('hidden');
            urlElement.removeClass ('hidden');
        }
    } else {
      // we need to make sure that focused element which are
      // hidden will still be focused
      if (urlElement)
          urlElement.removeClass ('hidden');
    }
});

function getURLElement () {
    if (!window.location.hash)
        return null;

    var hash = window.location.hash;
    return $ (hash).hasClass ('main-section') ? $(hash) : null;
}

$(document).on('mode-changed', function () {
    var singleMode = isFilterOneMode();
    disableBtnGroup (singleMode);
    if (singleMode) {
        $visible = getVisibleElements();
        var urlElement = getURLElement ();

        if ($visible.length == 0) {
            if (urlElement) {
                urlElement.removeClass ('hidden');
            } else {
                $hidden = getHiddenElements();
                $hidden.first().removeClass ('hidden');
            }
        }

        if ($visible.length > 1) {
            $visible.addClass ('hidden');
            if (urlElement) {
                urlElement.removeClass ('hidden');
            } else {
                $visible.first().removeClass ('hidden');
            }
        }
    } else {
      $(document).trigger ('filter-changed');
    }
});

$(document).on('filter-changed', function () {
    var groupStates = getGroupStates();
    if (groupStates['visible'].length == 0) {
        $(".btn-filter").first().addClass ('active');
         groupStates = getGroupStates();
    }

    groupStates['visible'].forEach (function (element, index) {
        $('#input-reference>.'+element).removeClass ('hidden');
    });
    groupStates['hidden'].forEach (function (element, index) {
        $('#input-reference>.'+element).addClass ('hidden');
    });
});

$(document).on('dimension-change', function() {
    if ($(window).scrollTop() > $('#input-reference').offset().top) {
        $('#top-link-block').css('left', $('#input-reference').width() + $('#input-reference').offset().left);
        $('#top-link-block').show();
    } else {
        $('#top-link-block').hide();
    }
});

$(function() {
    $(document).trigger ('mode-changed');

    $('.btn-filter').click(function(){
        $(this).toggleClass ('active');
        $(document).trigger ('filter-changed');
    });

    $('#btn-filter-one').change(function(){
        $(document).trigger ('mode-changed');
    });


    $('.nav-tabs a').click(function(){
        var element = $(this).attr('aria-controls');
        $('.tab-content .tab-pane').removeClass ('active');
        $('#'+element).addClass ('active');
    })

    $('#search').on('input', function(){
        var search = $('#search').val().trim().toLowerCase();
        if (!search)
            return $('.tab-content li').show();

        $('.tab-content li').each (function (index, element) {
            var $element = $(element);
            if ($element.data('name').trim().toLowerCase().indexOf(search) == -1)
                $element.hide();
            else
                $element.show();
        });
    });

    $(window).resize(function() {
      $(document).trigger ('dimension-change');
    });
    $(window).scroll(function() {
        $(document).trigger ('dimension-change');
    });

    var latex = $('.md-expression');
    latex.each (function (index, element){
      var code = $(element).text();
      if (code.startsWith('{$'))
        code = code.substring(2);

      if (code.endsWith('$}'))
        code = code.substring (0, code.length - 2);

      katex.render (code, element, { displayMode: false });
    });

    // in view plugin
    (function( $ ) {
        $.fn.inView = function() {
            var st = (document.documentElement.scrollTop || document.body.scrollTop),
            ot = $(this).offset().top,
            wh = (window.innerHeight && window.innerHeight < $(window).height()) ? window.innerHeight : $(window).height();

            return ot > st && ($(this).height() + ot) < (st + wh);
        };
    })( jQuery );
});