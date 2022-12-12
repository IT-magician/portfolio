const mixer = mixitup('.portfolio_container', {
  selectors: {
    target: '.portfolio_content'
  },
  animation: {
    duration: 300
  }
})

const portfolio_contents = document.querySelectorAll(".portfolio_content")

portfolio_contents.forEach(element => {
  element.querySelector("input[type='checkbox']").addEventListener("change", function (e) {
    if (this.checked) element.querySelector(".portfolio-details").classList.add("unfold")
    else element.querySelector(".portfolio-details").classList.remove("unfold")
  })
})

/* swiper */
const swiper = new Swiper('.activities_container', {
  // Optional parameters
  // direction: 'vertical',
  loop: true,
  spaceBetween: 16,
  grabCursor: true,

  // If we need pagination
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },

  // And if we need scrollbar
  scrollbar: {
    el: '.swiper-scrollbar',
  },

  breakpoints: {
    640: {
      slidesPerView: 2,
    },

    1024: {
      slidesPerView: 3,
    }
  }
});

gsap.from(".nav_item", {
  opacity: 0,
  duration: 1,
  delay: .1,
  y: -60,
  stagger: .2
})

  gsap.from(".home_img",{
    opacity: 0,
    duration: 2,
    delay: .5,
    x: 60
  })

/* ScrollReveal */
ScrollReveal().reveal('.nav_logo', {
  distance: '-50px',
  delay: 100,
  duration: 500,
  // reset: true,
});

ScrollReveal().reveal('.home_social-icon', {
  origin: 'left',
  distance: '-60px',
  delay: 100,
  duration: 750,
  reset: true,
});


ScrollReveal().reveal('.home_social-icon', {
  origin: 'left',
  distance: '50px',
  delay: 100,
  duration: 750,
  reset: true,
});


ScrollReveal().reveal('.home_greeting', {
  distance: '50px',
  delay: 100,
  duration: 500,
  reset: true,
});
ScrollReveal().reveal('.home_name', {
  distance: '50px',
  delay: 200,
  duration: 500,
  reset: true,
});
ScrollReveal().reveal('.home_profession', {
  distance: '50px',
  delay: 300,
  duration: 500,
  reset: true,
});


// ScrollReveal().reveal('.home_img', {
//   origin: 'right',
//   distance: '50px',
//   delay: 200,
//   duration: 500,
//   reset: true,
// });


ScrollReveal().reveal('#about .about_description', {
  distance: '50px',
  delay: 150,
  duration: 500,
  reset: true,
});
ScrollReveal().reveal('.about_number', {
  distance: '50px',
  delay: 150,
  duration: 500,
  reset: true,
});

ScrollReveal().reveal('.qualification_container', {
  distance: '50px',
  delay: 175,
  duration: 500,
  reset: true,
});

ScrollReveal().reveal('.skills_data ', {
  distance: '100px',
  delay: 200,
  duration: 500,
  reset: true,
});
ScrollReveal().reveal('.portfolio_content ', {
  distance: '100px',
  delay: 225,
  duration: 500,
  // reset: true,
});

ScrollReveal().reveal('.activities_container ', {
  distance: '100px',
  delay: 250,
  duration: 500,
  reset: true,
});
