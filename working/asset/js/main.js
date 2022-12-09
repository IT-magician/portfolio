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
console.log(element.querySelector("input[type='checkbox']"))

  element.querySelector("input[type='checkbox']").addEventListener("change", function (e) {
    if (this.checked) element.querySelector(".portfolio-details").classList.add("unfold")
    else element.querySelector(".portfolio-details").classList.remove("unfold")
  })
})


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

    breakpoints:{
        640:{
            slidesPerView:2,
        },
        
        1024:{
            slidesPerView:3,
        }
    }
  });

  gsap.from(".home_img",{
    opacity: 0,
    duration: 2,
    delay: .5,
    x: 60
  })
  gsap.from(".home_data",{
    opacity: 0,
    duration: 2,
    delay: .8,
    y: -60
  })
  gsap.from(".home_greeting, .home_name, .home_profession, .home_btn",{
    opacity: 0,
    duration: 2,
    delay: 1,
    x: 25,
    ease: 'expo.out',
    stagger: .2
  })
  gsap.from(".nav_item, .nav_logo",{
    opacity: 0,
    duration: 1,
    delay: .8,
    y: -60,
    stagger: .2
  })