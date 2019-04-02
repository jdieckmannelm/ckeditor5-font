/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/ui/colorui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import {
	addColorTableToDropdown,
	normalizeColorOptions,
	getLocalizedColorOptions
} from '../utils';

/**
 * The color UI plugin which isolates the common logic responsible for displaying dropdowns with color grids.
 *
 * It is used to create the `'fontBackgroundColor'` and the `'fontColor'` dropdowns, each hosting
 * a {@link module:font/ui/colortableview~ColorTableView}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ColorUI extends Plugin {
	/**
	 * Creates a plugin which brings dropdown with a pre–configured {@link module:font/ui/colortableview~ColorTableView}
	 *
	 * @param {module:core/editor/editor~Editor} editor
	 * @param {Object} config Configuration object
	 * @param {String} config.commandName Name of command which will be executed when a color tile is clicked.
	 * @param {String} config.componentName Name of the dropdown in the {@link module:ui/componentfactory~ComponentFactory}
	 * and the configuration scope name in `editor.config`.
	 * @param {String} config.icon SVG icon used by the dropdown.
	 * @param {String} config.dropdownLabel Label used by the dropdown.
	 */
	constructor( editor, { commandName, icon, componentName, dropdownLabel } ) {
		super( editor );

		/**
		 * Name of the command which will be executed when a color tile is clicked.
		 * @type {String}
		 */
		this.commandName = commandName;

		/**
		 * Name of this component in the {@link module:ui/componentfactory~ComponentFactory}.
		 * Also the configuration scope name in `editor.config`.
		 * @type {String}
		 */
		this.componentName = componentName;

		/**
		 * SVG icon used by the dropdown.
		 * @type {String}
		 */
		this.icon = icon;

		/**
		 * Label used by the dropdown.
		 * @type {String}
		 */
		this.dropdownLabel = dropdownLabel;

		/**
		 * Number of columns in color grid. Determines the number of recent colors to be displayed.
		 * @type {Number}
		 */
		this.columns = editor.config.get( `${ this.componentName }.columns` );

		/**
		 * Keeps reference to {@link module:font/ui/colortableview~ColorTableView}.
		 * @type {module:font/ui/colortableview~ColorTableView}
		 */
		this.colorTableView;
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;
		const command = editor.commands.get( this.commandName );
		const colorsConfig = normalizeColorOptions( editor.config.get( this.componentName ).colors );
		const localizedColors = getLocalizedColorOptions( editor, colorsConfig );

		// Register UI component.
		editor.ui.componentFactory.add( this.componentName, locale => {
			const dropdownView = createDropdown( locale );
			this.colorTableView = addColorTableToDropdown( {
				dropdownView,
				colors: localizedColors.map( option => ( {
					label: option.label,
					color: option.model,
					options: {
						hasBorder: option.hasBorder
					}
				} ) ),
				columns: this.columns,
				removeButtonLabel: t( 'Remove color' )
			} );

			this.colorTableView.bind( 'selectedColor' ).to( command, 'value' );

			dropdownView.buttonView.set( {
				label: this.dropdownLabel,
				icon: this.icon,
				tooltip: true
			} );

			dropdownView.extendTemplate( {
				attributes: {
					class: 'ck-color-ui-dropdown'
				}
			} );

			dropdownView.bind( 'isEnabled' ).to( command );

			dropdownView.on( 'execute', ( evt, data ) => {
				editor.execute( this.commandName, data );
				editor.editing.view.focus();
			} );

			return dropdownView;
		} );

		// Update recently used colors when user change data in editor.
		editor.model.document.on( 'change:data', () => {
			const model = editor.model;
			const changes = model.document.differ.getChanges();
			changes.forEach( change => {
				if ( change.type === 'insert' ) {
					const position = change.position;
					const range = model.createRange( position, position.getShiftedBy( change.length ) );
					const walker = range.getWalker( { ignoreElementEnd: true } );

					let item = walker.next();

					while ( !item.done ) {
						if ( item.value.type === 'text' ) {
							// Only text nodes can have color attributes.
							const color = item.value.item.getAttribute( this.commandName );
							if ( color ) {
								this.addColorToRecentlyUsed( color );
							}
						}
						item = walker.next();
					}
				} else if (
					change.type === 'attribute' &&
					change.attributeKey === this.commandName &&
					change.attributeNewValue
				) {
					this.addColorToRecentlyUsed( change.attributeNewValue );
				}
			} );
		} );
	}

	/**
	 * Method tries to find color on predefined color list to use proper settings (e.g. label).
	 * If color is not found then provides label with color's value.
	 *
	 * @param {String} color String which stores value of recently applied color
	 */
	addColorToRecentlyUsed( color ) {
		const predefinedColor = this.colorTableView.colorDefinitions
			.find( definition => definition.color === color );
		this.colorTableView.recentlyUsedColors.add( {
			color: predefinedColor ? predefinedColor.color : color,
			label: predefinedColor ? predefinedColor.label : color,
			hasBorder: predefinedColor && predefinedColor.options ? predefinedColor.options.hasBorder : false
		}, 0 );
	}
}
