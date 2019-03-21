/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontfamily/fontfamilyediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import FontBackgroundColorCommand from './fontbackgroundcolorcommand';

import { FONT_BACKGROUND_COLOR, renderDowncastElement, renderUpcastAttribute } from '../utils';

export default class FontBackgroundColorEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		editor.config.define( FONT_BACKGROUND_COLOR, {
			colors: [
				{
					color: 'hsl(0, 0%, 0%)',
					label: 'Black'
				}, {
					color: 'hsl(0, 0%, 30%)',
					label: 'Dim grey'
				}, {
					color: 'hsl(0, 0%, 60%)',
					label: 'Grey'
				}, {
					color: 'hsl(0, 0%, 90%)',
					label: 'Light grey'
				}, {
					color: 'hsl(0, 0%, 100%)',
					label: 'White',
					hasBorder: true
				}, {
					color: 'hsl(0, 75%, 60%)',
					label: 'Red'
				}, {
					color: 'hsl(30, 75%, 60%)',
					label: 'Orange'
				}, {
					color: 'hsl(60, 75%, 60%)',
					label: 'Yellow'
				}, {
					color: 'hsl(90, 75%, 60%)',
					label: 'Light green'
				}, {
					color: 'hsl(120, 75%, 60%)',
					label: 'Green'
				}, {
					color: 'hsl(150, 75%, 60%)',
					label: 'Aquamarine'
				}, {
					color: 'hsl(180, 75%, 60%)',
					label: 'Turquoise'
				}, {
					color: 'hsl(210, 75%, 60%)',
					label: 'Light blue'
				}, {
					color: 'hsl(240, 75%, 60%)',
					label: 'Blue'
				}, {
					color: 'hsl(270, 75%, 60%)',
					label: 'Purple'
				}
			]
		} );

		editor.conversion.for( 'upcast' ).elementToAttribute( {
			view: {
				name: 'span',
				styles: {
					'background-color': /[\s\S]+/
				}
			},
			model: {
				key: FONT_BACKGROUND_COLOR,
				value: renderUpcastAttribute( 'background-color' )
			}
		} );

		editor.conversion.for( 'downcast' ).attributeToElement( {
			model: FONT_BACKGROUND_COLOR,
			view: renderDowncastElement( 'background-color' )
		} );

		editor.commands.add( FONT_BACKGROUND_COLOR, new FontBackgroundColorCommand( editor ) );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// Allow fontBackgroundColor attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: FONT_BACKGROUND_COLOR } );
	}
}
