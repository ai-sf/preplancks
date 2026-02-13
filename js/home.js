---
---

(function ($) {
    $(function () {


  // Set the date we're counting down to
  var countDownDate = new Date( {{ site.data.home.countdown | jsonify }} ).getTime();

  // Italian date formatter
  var dateFormatter = new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  var formattedDate = dateFormatter.format(countDownDate);

  // Update the count down every 1 second
  var x = setInterval(function() {

    // Get today's date and time
    var now = new Date().getTime();

    // Find the distance between now and the count down date
    var distance = countDownDate - now;

    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Output the result in an element with id="countdown"
    document.getElementById("countdown").innerHTML =
      "Le iscrizioni terminano il " + formattedDate + "<br><br>" +
      "Mancano " + days + "d " + hours + "h " +
      minutes + "m " + seconds + "s ";

    // If the count down is over, write some text
    if (distance < 0) {
      clearInterval(x);
      document.getElementById("countdown").innerHTML = "ISCRIZIONI TERMINATE";
    }
  }, 1000);


        $("#index-page").css("padding-top", $(".slider").height()+50);
        $("#chevron-banner").click(function(){
            $('html, body').animate({
                scrollTop: ($(".slider").height())
            },500);
        });
    }); // end of document ready
})(jQuery); // end of jQuery name space