import { registerBlockType } from '@wordpress/blocks';
import edit from './edit';
import save from './save';
import "./style.scss";

registerBlockType( 'sotech-blocks/latest-posts', {
	edit: edit,
	save: save,
} );
