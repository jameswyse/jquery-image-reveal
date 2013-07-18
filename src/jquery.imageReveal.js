/*
 * jQuery Image Reveal - A Simple Before/After Image Viewer
 *
 * Version: Master
 * Homepage: http://github.com/lemoncreative/jquery-image-reveal
 * Licence: MIT
 * Copyright: (c) 2013 Lemon Creative;
 */

(function ($) {
  $.fn.extend({ imageReveal: function (options) {
    var dragging = false
      , $el = {};

    // Extend default options with given options
    options = $.extend({
        barWidth: 20
      , touchBarWidth: 60
      , startPosition: 50
      , paddingLeft: 0
      , paddingRight: 0
      , showCaption: false
      , captionChange: 0.5
      , width: 500
      , height: 500
    }, options);

    // Detect touch devices and swap barWidth for touchBarWidth
    if(!!('ontouchstart' in window) || !!('onmsgesturechange' in window)) {
      options.barWidth = options.touchBarWidth;
    }

    // Ensure startPosition is valid.
    if(options.startPosition > (options.width - options.barWidth)) {
      options.startPosition = options.width - options.barWidth;
    } else if(options.startPosition < 0) options.startPosition = 0;

    // Ensure captionChange is valid
    if(options.captionChange > 1) options.captionChange = 1;
    else if(options.captionChange < 0) options.captionChange = 0;

    // Update - Moves the overlay and drag bar to the new location and displays the correct caption.
    function update(width, id) {
      width = width - (options.barWidth / 2);
      if(width > options.paddingLeft && width <= options.width - (options.paddingRight + options.barWidth)) {
        $el[id].drag.css({ left: width });
        $el[id].overlay.width(width);
      }
      if(options.showCaption) {
        if (width > options.width * options.captionChange) $el[id].caption.text($el[id].before.attr('title'));
        else $el[id].caption.text($el[id].after.attr('title'));
      }
    }

    // handleEvent - Calls 'update' if the event is valid
    function handleEvent(e) {
      var id = $(this).data('imageRevealID');

      if(!dragging && e.type !== 'click') return false;
      var position;

      if(e.originalEvent && e.originalEvent.changedTouches) {
        position = e.originalEvent.changedTouches[0].pageX;
      } else position = e.pageX;

      var offset = position - $el[id].overlay.offset().left;

      if(offset < 0) offset = 0;
      if(offset > options.width) offset = options.width;

      update(offset, id);
      return false;
    }

    return this.each(function (i) {
      $el[i] = {};

      // Container
      $el[i].container = $(this).addClass('imageReveal').data('imageRevealID', i);

      // Before Image
      $el[i].before = $el[i].container.children('img').first()
        .width(options.width)
        .height(options.height)
        .hide();

      // After Image
      $el[i].after  = $el[i].before.next()
        .width(options.width)
        .height(options.height)
        .hide();

      // Set up container
      $el[i].container
        .width(options.width)
        .height(options.height)
        .css({ overflow: 'hidden', position: 'relative' })
        .append('<div class="imageReveal-overlay"></div>')
        .append('<div class="imageReveal-background"></div>')
        .append('<div class="imageReveal-drag"></div>')
        .append('<div class="imageReveal-caption">' + $el[i].before.attr('title') + '</div>');

      // Background
      $el[i].bg = $el[i].container.children('.imageReveal-background')
        .width(options.width)
        .height(options.height)
        .css({
            'background-image': 'url(' + $el[i].after.attr('src') + ')'
          , 'background-size': options.width + 'px ' + options.height + 'px'
        });

      // Caption
      $el[i].caption = options.showCaption ? $el[i].container.children('.imageReveal-caption').show() : $el[i].container.children('.imageReveal-caption').hide();

      // Overlay
      $el[i].overlay = $el[i].container.children('.imageReveal-overlay')
        .width(options.width)
        .height(options.height)
        .css({
            'background-image': 'url(' + $el[i].before.attr('src') + ')'
          , 'background-size': options.width + 'px ' + options.height + 'px'
        })
        .animate({ width: options.width - options.startPosition - options.barWidth});

      // Drag Bar
      $el[i].drag = $el[i].container.children('.imageReveal-drag')
        .width(options.barWidth)
        .height(options.height)
        .animate({ right: options.startPosition })
        .on('mousedown touchstart', function() {
          dragging = true;
          $el[i].drag.addClass('dragging');
          return false;
        })
        .on('mouseup touchend touchcancel', function() {
          dragging = false;
          $el[i].drag.removeClass('dragging');
          return false;
        });

      // Catch mouseup on document as well, just in case the user
      // drags outside the container.
      $(document).mouseup(function() {
        if(!dragging) return;

        dragging = false;
        $el[i].drag.removeClass('dragging');
      });

    }).on('mousemove click touchmove', handleEvent);
  }});
})(jQuery);
