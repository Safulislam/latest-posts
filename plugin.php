<?php
/**
 * Plugin Name: Latest Posts Block
 * Description: Display and filter latest posts block.
 * Version: 1.0.1
 * Author: Saiful Islam
 * Author URI: https://devsaiful.com
 * Domain Path: /i18n/languages/
 * Text Domain: latest-posts
 *
 * @package sotech blocks
 */
function sotech_blocks_latest_posts_block_init() {
	register_block_type_from_metadata(
		__DIR__,
		array(
			'render_callback' => 'render_latest_posts_block',
		)
	);
}
add_action( 'init', 'sotech_blocks_latest_posts_block_init' );

/**
 * Render latest posts block function.
 *
 * @param mixed $attributes plugin attributes.
 *
 * @return statement
 */
function render_latest_posts_block( $attributes ) {
	$args = array(
		'posts_per_page' => $attributes['numberOfPosts'],
		'post_status'    => 'publish',
		'order'          => $attributes['order'],
		'orderby'        => $attributes['orderBy'],
	);

	if ( isset( $attributes['categories'] ) && is_array( $attributes['categories'] ) ) {
		$args['category__in'] = array_column( $attributes['categories'], 'id' );
	}

	$recent_posts  = get_posts( $args );
	$layout        = $attributes['layout'] ?? 'list';
	$layout_class  = 'layout-' . sanitize_html_class( $layout );
	$wrapper_attrs = get_block_wrapper_attributes( array( 'class' => $layout_class ) );

	if ( empty( $recent_posts ) ) {
		return '<p>' . esc_html__( 'No posts found.', 'latest-posts' ) . '</p>';
	}

	// Start wrapper.
	if ( 'carousel' === $layout ) {
		$posts  = '<div ' . $wrapper_attrs . '>';
		$posts .= '<div class="swiper"><div class="swiper-wrapper">';
	} else {
		$posts = '<ul ' . $wrapper_attrs . '>';
	}

	foreach ( $recent_posts as $post ) {
		$title     = get_the_title( $post );
		$title     = $title ? $title : __( '(No title)', 'latest-posts' );
		$permalink = get_permalink( $post );
		$excerpt   = get_the_excerpt( $post );
		$author    = get_the_author_meta( 'display_name', $post->post_author );
		$date      = get_the_date( '', $post );
		$image     = '';

		if ( ! empty( $attributes['displayFeaturedImage'] ) && has_post_thumbnail( $post ) ) {
			$image = get_the_post_thumbnail( $post, 'large' );
		}

		$post_html  = '';
		$post_html .= $image;
		$post_html .= '<div class="latest-post-details">';
		$post_html .= '<h5><a href="' . esc_url( $permalink ) . '">' . esc_html( $title ) . '</a></h5>';

		if ( ! empty( $attributes['displayAuthor'] ) && $author ) {
			$post_html .= '<p>' . esc_html__( 'By', 'latest-posts' ) . ' ' . esc_html( $author ) . '</p>';
		}

		if ( ! empty( $attributes['displayDate'] ) && $date ) {
			$post_html .= '<time datetime="' . esc_attr( get_the_date( 'c', $post ) ) . '">' . esc_html( $date ) . '</time>';
		}

		if ( ! empty( $attributes['displayExcerpt'] ) && ! empty( $excerpt ) ) {
			$post_html .= '<p>' . esc_html( $excerpt ) . '</p>';
		}

		$post_html .= '</div>';

		if ( 'carousel' === $layout ) {
			$posts .= '<div class="swiper-slide">' . $post_html . '</div>';
		} else {
			$posts .= '<li>' . $post_html . '</li>';
		}
	}

	if ( 'carousel' === $layout ) {
		$posts .= '</div>'; // .swiper-wrapper.
		$posts .= '<div class="swiper-pagination"></div>'; // Optional pagination.
		$posts .= '</div>'; // .swiper.
		$posts .= '</div>'; // block wrapper.
	} else {
		$posts .= '</ul>';
	}

	return $posts;
}

/**
 * _enqueue_swiper_assets
 *
 * @return void
 */
function enqueue_swiper_assets() {
	// Only enqueue on frontend if block is present.
	if ( has_block( 'sotech-blocks/latest-posts' ) ) {
		// Swiper CSS.
		wp_enqueue_style(
			'stb-swiper',
			'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css',
			array(),
			'11.0.0'
		);

		// Swiper JS.
		wp_enqueue_script(
			'stb-swiper',
			'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js',
			array(),
			'11.0.0',
			true
		);

		// Custom Init JS.
		wp_enqueue_script(
			'stb-carousel-init',
			plugins_url( 'assets/carousel-init.js', __FILE__ ),
			array( 'stb-swiper' ),
			'1.0.0',
			true
		);
	}
}
add_action( 'wp_enqueue_scripts', 'enqueue_swiper_assets' );
