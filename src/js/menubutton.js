(function() {

  var menubutton = document.querySelector('.menu-button');
  var menu = document.querySelector('.menu-list');

  function toggleMenu() {
    menu.classList.toggle('menu-list--open');
    menubutton.classList.toggle('menu-button--menu-open');
  }

  menubutton.addEventListener('click', function(evt) {
    evt.preventDefault();
    toggleMenu();
  });

  window.addEventListener('keydown', function(evt) {
    if (evt.keyCode === 27 && menu.classList.contains('menu-list--open')) {
      evt.preventDefault();
      toggleMenu();
    }
  });

})();
