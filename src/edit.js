import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { RawHTML } from '@wordpress/element';
// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
import { format, dateI18n, __experimentalGetSettings } from '@wordpress/date';
import {
	PanelBody,
	ToggleControl,
	SelectControl,
	QueryControls,
} from '@wordpress/components';
import {
	useBlockProps,
	InspectorControls,
} from '@wordpress/block-editor';
import { Pagination } from 'swiper/modules';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import './editor.scss';

export default function Edit({ attributes, setAttributes }) {
	const {
		numberOfPosts,
		displayFeaturedImage,
		displayExcerpt,
		displayAuthor,
		displayDate,
		order,
		orderBy,
		categories,
		layout,
	} = attributes;

	const blockProps = useBlockProps({
		className: `layout-${layout} ${layout === 'carousel' ? 'latest-posts-swiper' : ''}`,
	});

	const [posts, setPosts] = useState([]);
	const [allCategories, setAllCategories] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	const categoryIds = Array.isArray(categories)
		? categories.map((cat) => cat?.id)
		: [];

	useEffect(() => {
		setIsLoading(true);

		let path = `/wp/v2/posts?per_page=${numberOfPosts}&_embed=true&order=${order}&orderby=${orderBy}`;

		if (categoryIds.length > 0) {
			path += `&categories=${categoryIds.join(',')}`;
		}

		apiFetch({ path })
			.then((data) => setPosts(data))
			.catch((err) => {
				console.error('Error fetching posts:', err);
				setPosts([]);
			})
			.finally(() => setIsLoading(false));
	}, [numberOfPosts, order, orderBy, categoryIds.join(',')]);

	useEffect(() => {
		apiFetch({ path: '/wp/v2/categories?per_page=100' }).then((data) => {
			setAllCategories(data);
		});
	}, []);

	const categorySuggestions = {};
	if (Array.isArray(allCategories)) {
		allCategories.forEach((cat) => {
			categorySuggestions[cat.name] = cat;
		});
	}

	const handleCategoryChange = (selectedValues) => {
		const isValid = selectedValues.every(
			(value) => typeof value !== 'string' || categorySuggestions[value]
		);
		if (!isValid) return;

		const newCategories = selectedValues.map((token) =>
			typeof token === 'string' ? categorySuggestions[token] : token
		);
		setAttributes({ categories: newCategories });
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Query Options', 'latest-posts')}>
					<QueryControls
						numberOfItems={numberOfPosts}
						onNumberOfItemsChange={(value) =>
							setAttributes({ numberOfPosts: value })
						}
						minItems={1}
						maxItems={100}
						order={order}
						onOrderChange={(value) => setAttributes({ order: value })}
						orderBy={orderBy}
						onOrderByChange={(value) => setAttributes({ orderBy: value })}
						categorySuggestions={categorySuggestions}
						selectedCategories={categories}
						onCategoryChange={handleCategoryChange}
					/>
				</PanelBody>

				<PanelBody title={__('Display Options', 'latest-posts')} initialOpen={true}>
					<SelectControl
						label={__('Layout', 'latest-posts')}
						value={layout}
						options={[
							{ label: __('Grid', 'latest-posts'), value: 'grid' },
							{ label: __('List', 'latest-posts'), value: 'list' },
							{ label: __('Carousel', 'latest-posts'), value: 'carousel' },
						]}
						onChange={(value) => setAttributes({ layout: value })}
					/>
					<ToggleControl
						label={__('Show Featured Image', 'latest-posts')}
						checked={displayFeaturedImage}
						onChange={(value) => setAttributes({ displayFeaturedImage: value })}
					/>
					<ToggleControl
						label={__('Show Excerpt', 'latest-posts')}
						checked={displayExcerpt}
						onChange={(value) => setAttributes({ displayExcerpt: value })}
					/>
					<ToggleControl
						label={__('Show Author', 'latest-posts')}
						checked={displayAuthor}
						onChange={(value) => setAttributes({ displayAuthor: value })}
					/>
					<ToggleControl
						label={__('Show Date', 'latest-posts')}
						checked={displayDate}
						onChange={(value) => setAttributes({ displayDate: value })}
					/>
				</PanelBody>
			</InspectorControls>

			{isLoading ? (
				<p>{__('Loading posts...', 'latest-posts')}</p>
			) : posts.length ? (
				layout === 'carousel' ? (
					<div {...blockProps}>
						<Swiper
							modules={[Pagination]}
							pagination={{ clickable: true }}
							slidesPerView={1}
							spaceBetween={20}
							breakpoints={{
								640: { slidesPerView: 2 },
								1024: { slidesPerView: 3 },
							}}
						>
							{posts.map((post) => {
								const featuredImage = post?._embedded?.['wp:featuredmedia']?.[0];
								const authorName = post?._embedded?.author?.[0]?.name || '';
								const imageUrl = featuredImage?.media_details?.sizes?.large?.source_url;
								const imageAlt = featuredImage?.alt_text || '';

								return (
									<SwiperSlide key={post.id}>
										{displayFeaturedImage && imageUrl && (
											<img src={imageUrl} alt={imageAlt} />
										)}
										<div className="latest-post-details">
											<h5>
												<a href={post.link}>
													{post.title?.rendered ? (
														<RawHTML>{post.title.rendered}</RawHTML>
													) : (
														__('(No title)', 'latest-posts')
													)}
												</a>
											</h5>

											{displayAuthor && authorName && (
												<p>{__('By', 'latest-posts')} {authorName}</p>
											)}

											{displayDate && post.date_gmt && (
												<time dateTime={format('c', post.date_gmt)}>
													{dateI18n(
														__experimentalGetSettings().formats.date,
														post.date_gmt
													)}
												</time>
											)}

											{displayExcerpt && post.excerpt?.rendered && (
												<RawHTML>{post.excerpt.rendered}</RawHTML>
											)}
										</div>
									</SwiperSlide>
								);
							})}
						</Swiper>
					</div>
				) : (
					<ul {...blockProps}>
						{posts.map((post) => {
							const featuredImage = post?._embedded?.['wp:featuredmedia']?.[0];
							const authorName = post?._embedded?.author?.[0]?.name || '';
							const imageUrl = featuredImage?.media_details?.sizes?.large?.source_url;
							const imageAlt = featuredImage?.alt_text || '';

							return (
								<li key={post.id}>
									{displayFeaturedImage && imageUrl && (
										<img src={imageUrl} alt={imageAlt} />
									)}
									<div className="latest-post-details">
										<h5>
											<a href={post.link}>
												{post.title?.rendered ? (
													<RawHTML>{post.title.rendered}</RawHTML>
												) : (
													__('(No title)', 'latest-posts')
												)}
											</a>
										</h5>

										{displayAuthor && authorName && (
											<p>{__('By', 'latest-posts')} {authorName}</p>
										)}

										{displayDate && post.date_gmt && (
											<time dateTime={format('c', post.date_gmt)}>
												{dateI18n(
													__experimentalGetSettings().formats.date,
													post.date_gmt
												)}
											</time>
										)}

										{displayExcerpt && post.excerpt?.rendered && (
											<RawHTML>{post.excerpt.rendered}</RawHTML>
										)}
									</div>
								</li>
							);
						})}
					</ul>
				)
			) : (
				<p>{__('No posts found.', 'latest-posts')}</p>
			)}
		</>
	);
}
