/* global Shrimply */

Shrimply.boot = {};

Shrimply.boot.registerEvents = function() {
  Shrimply.events.billboard();
  Shrimply.events.registerNavbarEvent();
  Shrimply.events.registerParallaxEvent();
  Shrimply.events.registerScrollDownArrowEvent();
  Shrimply.events.registerScrollTopArrowEvent();
  Shrimply.events.registerImageLoadedEvent();
};

Shrimply.boot.refresh = function() {
  Shrimply.plugins.fancyBox();
  Shrimply.plugins.codeWidget();
  Shrimply.events.refresh();
};

document.addEventListener('DOMContentLoaded', function() {
  Shrimply.boot.registerEvents();
});
