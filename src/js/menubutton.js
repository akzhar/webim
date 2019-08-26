(function() {

  var menubutton = document.querySelector('.menu-button');
  var menues = document.querySelectorAll('.menu-list');

  function toggleMenu() {
    [].forEach.call(menues, function(menu) {
      menu.classList.toggle('menu-list--open');
    });
    menubutton.classList.toggle('menu-button--menu-open');
  }

  menubutton.addEventListener('click', function(evt) {
    evt.preventDefault();
    toggleMenu();
  });

  window.addEventListener('keydown', function(evt) {
    if (evt.keyCode === 27 && menubutton.classList.contains('menu-button--menu-open')) {
      evt.preventDefault();
      toggleMenu();
    }
  });

})();
