Template.navbar.onRendered(function() {
  $(document).on('click','.navbar-collapse.in .navbar-header', function(e) {
    if($(e.target).is('a') && $(e.target).attr('class') != 'dropdown-toggle') {
      $(this).collapse('hide');
    }
  });
});
