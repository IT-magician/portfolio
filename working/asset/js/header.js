// Show Menu
function showMenu(toggleId,navId) {
    const toggle = document.getElementById(toggleId),
            nav = document.getElementById(navId)

    if (toggle && nav){
        toggle.addEventListener('click', function(e){
            nav.classList.toggle('show-menu')
        })
    }
}

showMenu('nav-toggle','nav-menu')


// remove menu mobile
// const navLink = document.querySelectorAll(".nav_link")

// navLink.forEach(n => n.addEventListener('click',function(e){
//     const navMenu = document.getElementById('nav-menu')
//     navMenu.classList.remove('show-menu')
// }))

// scroll sections active link
const sections = document.querySelectorAll('section[id]')

function scrollActive(){
    const scrollY = window.pageYOffset

    sections.forEach(current => {
        const sectionHeight = current.offsetHeight
        const sectionTop = current.offsetTop - 50
        sectionId = current.getAttribute('id')
// console.log(sectionId)
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight){
            // css 선택자 설명
            // https://wallel.com/css-%EC%86%8D%EC%84%B1-%EC%84%A0%ED%83%9D%EC%9E%90-%EC%A0%95%EB%A6%AC-css-attribute-selector/
            document.querySelector('.nav_menu a[href*=' + sectionId + ']').classList.add('active-link')
        }
        else{
            document.querySelector('.nav_menu a[href*=' + sectionId + ']').classList.remove('active-link')
        }
    })
}
window.addEventListener('scroll', scrollActive)

// change background header
function scrollHeader(){
    const header = document.getElementById('header')
    if (this.scrollY >= 200) header.classList.add('scroll-header'); else header.classList.remove('scroll-header')
}
window.addEventListener('scroll', scrollHeader)