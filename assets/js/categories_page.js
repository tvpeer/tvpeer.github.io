
fetch('//tvpeer.github.io/assets/json/categories_list/allcategories.json')
.then(function(response) {
  return response.json();
})
.then(function(myJson) {
  const jsonData = JSON.parse(JSON.stringify(myJson));

  let text = "";
  let i;
  for (i = 0; i < jsonData.length; i++) {

text += 

'<div class="filter_list column is-4-desktop is-3-widescreen is-half-tablet">'+
        '<div class="card">'+
          '<header class="card-header">'+
            '<p class="card-header-title">'+
              '<span>'+jsonData[i]['name']+'</span>'+
            '</p>'+
          '</header>'+
          
          '<footer class="card-footer">'+
            '<a href="view/?id='+jsonData[i]['slug']+'" class="card-footer-item"><i class="fas fa-search"></i>Preview</a>'+
          '</footer>'+
        '</div>'+
      '</div>';

}

  document.getElementById("content_list").innerHTML = text;
  

  ;(function() {
    lazyload();
  })();

});

function CountrySearch() {
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    ul = document.getElementById("content_list");
    li = ul.getElementsByClassName("filter_list");
    
    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("div")[0];
        console.log(a);
        txtValue = a.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}