/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Preferences } from '@/src/types';

export const WHO_OPTIONS: ReadonlyArray<{ id: Preferences['travelers']; label: string }> = [
  { id: 'Couple', label: 'Just us two' },
  { id: 'Family', label: 'Family trip' },
  { id: 'Solo', label: 'Flying solo' },
  { id: 'Friends', label: 'The squad' },
];

export const MOOD_OPTIONS = [
  'Switch off',
  'Spa reset',
  'Quiet luxury',
  'Design stay',
  'Romantic',
  'Beach calm',
  'City energy',
  'Food & wine',
  'Outdoors',
  'Easy with kids',
] as const;

export const SCENE_OPTIONS = [
  'Beach & sun',
  'City pulse',
  'Mountains',
  'Countryside',
  'Island',
  'Lakeside',
  'Desert',
  'Snow & ski',
] as const;

export const WHEN_OPTIONS = ['Soon', 'This summer', 'This winter', 'Flexible'] as const;

export const AMENITY_OPTIONS: Preferences['amenities'] = ['Spa', 'Pool', 'Fine Dining', 'Pet Friendly'];
export const SETTING_OPTIONS: Preferences['settings'] = ['Secluded', 'Mountain View', 'Forest'];
