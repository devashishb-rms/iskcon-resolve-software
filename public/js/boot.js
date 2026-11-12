init();
if(!location.hash)history.replaceState(null,'',location.pathname+location.search+'#home');
render();
