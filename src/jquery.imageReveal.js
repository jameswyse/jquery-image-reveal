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
    var $el = {};

    // Merge passed in options with defaults
    options = $.extend({}, {
        barWidth: 20
      , touchBarWidth: 60
      , startPosition: 0.5
      , paddingLeft: 0
      , paddingRight: 0
      , showCaption: false
      , linkCaption: false
      , captionChange: 0.5
      , width: 500
      , height: 500
      , ids: []
    }, options);

    options.ids = [];

    // Ensure startPosition is valid.
    if(options.startPosition > 1) options.startPosition = 1;
    else if(options.startPosition < 0) options.startPosition = 0;

    // Ensure captionChange is valid
    if(options.captionChange > 1) options.captionChange = 1;
    else if(options.captionChange < 0) options.captionChange = 0;

    // Update - Moves the overlay and drag bar to the new location and displays the correct caption.
    function update(width, id) {

      // The width cannot be set lower than 0 or higher than options.width
      if(width < 0) width = 0;
      if(width > options.width) width = options.width;

      // The width must not go outside any specified padding
      if(width < options.paddingLeft) width = options.paddingLeft;
      if(width > (options.width - options.paddingRight)) width = options.width - options.paddingRight;

      // Apply new width
      $el[id].overlay.width(width);

      // The drag bar 'left' position should be set to (width - barWidth/2) so we always drag from the center.
      var dragBarPosition = width - (options.barWidth / 2);
      if(dragBarPosition < 0) dragBarPosition = 0;
      if(dragBarPosition > options.width - options.barWidth) dragBarPosition = options.width - options.barWidth;
      $el[id].drag.css({ left: dragBarPosition });

      // The caption should be set when the given threshold is met
      if(options.showCaption) {
        var beforeCaption = $el[id].before.attr('title'),
            afterCaption = $el[id].after.attr('title');

        if (width > options.width * options.captionChange) {
          if(beforeCaption && beforeCaption !== '') {
            $el[id].caption.text(beforeCaption).fadeIn(options.captionFade || 1000).data('link', $el[id].before.data('link'));
          }
          else $el[id].caption.fadeOut(options.captionFade || 1000);
        }
        else {
          if(afterCaption && afterCaption !== '') {
            $el[id].caption.text(afterCaption).fadeIn(options.captionFade || 1000).data('link', $el[id].after.data('link'));
          }
          else $el[id].caption.fadeOut(options.captionFade || 1000);
        }
      }

    }

    // handleEvent - Calls 'update' if the event is valid
    function handleEvent(e) {
      var id = $(this).data('imageRevealID');

      if(!$el[id].dragging && e.type !== 'click') return false;
      var position;

      // If it was a touch event
      if(e.originalEvent && e.originalEvent.changedTouches) {

        // Increase the bar width
        if(!options.touchDevice) {
          options.touchDevice = true;
          options.originalBarWidth = options.barWidth;
          options.barWidth = parseInt(options.touchBarWidth, 10);

          $.each(options.ids, function(index, value) {
            var dragBarPosition = $el[value].drag.position().left - ((options.touchBarWidth / 2) - (options.originalBarWidth / 2));
            $el[value].drag.width(options.touchBarWidth).css({ left: dragBarPosition });
          });
        }
        // Get position from touch event
        position = e.originalEvent.changedTouches[0].pageX;
      }
      // Otherwise get position from mouse event
      else {
        position = e.pageX;
      }


      // Call update with new width
      update(position - $el[id].overlay.offset().left, id);
      return false;
    }

    return this.each(function (i) {
      $el[i] = {};
      options.ids.push(i);

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
      $el[i].caption = $el[i].container.children('.imageReveal-caption');

      if(options.showCaption && $el[i].before.attr('title') && $el[i].before.attr('title') !== '') {
        $el[i].caption.show();
      } else $el[i].caption.hide();

      if(options.linkCaption) {
        $el[i].caption
          .css('cursor', 'pointer')
          .data('link', $el[i].before.data('link'))
          .on('click', function() {
            if($el[i].caption.data('link')) window.location = $el[i].caption.data('link');
            return false;
          });
      }

      // Overlay
      $el[i].overlay = $el[i].container.children('.imageReveal-overlay')
        .width(options.width)
        .height(options.height)
        .css({
            'background-image': 'url(' + $el[i].before.attr('src') + ')'
          , 'background-size': options.width + 'px ' + options.height + 'px'
        })
        .animate({ width: options.width - (options.width * options.startPosition) });

      // Drag Bar
      $el[i].drag = $el[i].container.children('.imageReveal-drag')
        .width(options.barWidth)
        .height(options.height)
        .animate({ right: (options.width * options.startPosition) - (options.barWidth / 2) })
        .on('mousedown touchstart', function() {
          $el[i].dragging = true;
          $el[i].drag.addClass('dragging');
          return false;
        })
        .on('mouseup touchend touchcancel', function() {
          $el[i].dragging = false;
          $el[i].drag.removeClass('dragging');
          return false;
        });

      // Catch mouseup on document for when the user
      // releases the mouse button outside the container.
      $(document).on('mouseup touchend touchcancel', function() {
        if(!$el[i].dragging) return;
        $el[i].dragging = false;
        $el[i].drag.removeClass('dragging');
      });

      // When the bar is dragged outside the container, immediately
      // move it to the min or max position. This avoids the bar
      // getting stuck when the mouse is moved too fast
      $el[i].container.on('mouseout', function(e) {
        if(!$el[i].dragging) return;
        update(e.pageX - $el[i].overlay.offset().left, i);
      });

    }).on('mousemove click touchmove', handleEvent);
  }});
})(jQuery);
