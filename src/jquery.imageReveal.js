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
    function update(width) {
      width = width - (options.barWidth / 2);
      if(width > options.paddingLeft && width <= options.width - (options.paddingRight + options.barWidth)) {
        $el.drag.css({ left: width });
        $el.overlay.width(width);
      }
      if(options.showCaption) {
        if (width > options.width * options.captionChange) $el.caption.text($el.before.attr('title'));
        else $el.caption.text($el.after.attr('title'));
      }
    }

    // handleEvent - Calls 'update' if the event is valid
    function handleEvent(e) {
      if(!dragging && e.type !== 'click') return false;

      var position;

      if(e.originalEvent && e.originalEvent.changedTouches) {
        position = e.originalEvent.changedTouches[0].pageX;
      } else position = e.pageX;

      var offset = position - $el.overlay.offset().left;

      if(offset < 0) offset = 0;
      if(offset > options.width) offset = options.width;

      update(offset);
      return false;
    }

    return this.each(function () {
      // Container
      $el.container = $(this).addClass('imageReveal');

      // Before Image
      $el.before = $el.container.children('img').first()
        .width(options.width)
        .height(options.height)
        .hide();

      // After Image
      $el.after  = $el.before.next()
        .width(options.width)
        .height(options.height)
        .hide();

      // Set up container
      $el.container
        .width(options.width)
        .height(options.height)
        .css({ overflow: 'hidden', position: 'relative' })
        .append('<div class="imageReveal-overlay"></div>')
        .append('<div class="imageReveal-background"></div>')
        .append('<div class="imageReveal-drag"></div>')
        .append('<div class="imageReveal-caption">' + $el.before.attr('title') + '</div>');

      // Background
      $el.bg = $el.container.children('.imageReveal-background')
        .width(options.width)
        .height(options.height)
        .css({
            'background-image': 'url(' + $el.after.attr('src') + ')'
          , 'background-size': options.width + 'px ' + options.height + 'px'
        });

      // Caption
      $el.caption = options.showCaption ? $el.container.children('.imageReveal-caption').show() : $el.container.children('.imageReveal-caption').hide();

      // Overlay
      $el.overlay = $el.container.children('.imageReveal-overlay')
        .width(options.width)
        .height(options.height)
        .css({
            'background-image': 'url(' + $el.before.attr('src') + ')'
          , 'background-size': options.width + 'px ' + options.height + 'px'
        })
        .animate({ width: options.width - options.startPosition - options.barWidth});

      // Drag Bar
      $el.drag = $el.container.children('.imageReveal-drag')
        .width(options.barWidth)
        .height(options.height)
        .animate({ right: options.startPosition })
        .on('mousedown touchstart', function() {
          dragging = true;
          $el.drag.addClass('dragging');
          return false;
        })
        .on('mouseup touchend touchcancel', function() {
          dragging = false;
          $el.drag.removeClass('dragging');
          return false;
        });

      // Catch mouseup on document as well, just in case the user
      // drags outside the container.
      $(document).mouseup(function() {
        if(!dragging) return;

        dragging = false;
        $el.drag.removeClass('dragging');
      });

    }).on('mousemove click touchmove', handleEvent);
  }});
})(jQuery);
