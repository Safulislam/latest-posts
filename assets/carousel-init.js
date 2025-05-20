document.addEventListener('DOMContentLoaded', function () {
	const carousels = document.querySelectorAll('.layout-carousel .swiper');

	carousels.forEach((carousel) => {
		new Swiper(carousel, {
			slidesPerView: 1,
			spaceBetween: 20,
			loop: true,
			pagination: {
				el: '.swiper-pagination',
				clickable: true,
			},
			breakpoints: {
				640: { slidesPerView: 1 },
				768: { slidesPerView: 2 },
				1024: { slidesPerView: 3 },
			}
		});
	});
});
