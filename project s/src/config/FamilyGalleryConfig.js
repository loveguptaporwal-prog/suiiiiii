import leftFrontPhoto from '../../her/images/photo10.jpeg';
import leftBackPhoto from '../../her/images/photo5.jpeg';
import rightFrontPhoto from '../../her/images/photo9.jpeg';
import rightBackPhoto from '../../her/images/photo7.jpeg';

export const FAMILY_GALLERY_CONFIG = [
  {
    id: 'left-wall-memory-front',
    title: 'Birthday Memories',
    year: '2026',
    imageSrc: leftFrontPhoto,
    frameStyle: 'gold',
    size: [1.55, 2.70],
    position: [-6.90, 2.60, -2.0],
    rotY: Math.PI / 2,
    hasLight: false,
    accentColor: '#D81B60',
    caption: 'A favorite birthday memory',
  },
  {
    id: 'left-wall-memory-back',
    title: 'A Special Moment',
    year: '2026',
    imageSrc: leftBackPhoto,
    frameStyle: 'rosewood',
    size: [1.55, 2.70],
    position: [-6.90, 2.60, -12.0],
    rotY: Math.PI / 2,
    hasLight: false,
    accentColor: '#FF7043',
    caption: 'A moment worth remembering',
  },
  {
    id: 'right-wall-memory-front',
    title: 'Together in Joy',
    year: '2026',
    imageSrc: rightFrontPhoto,
    frameStyle: 'gold',
    size: [1.55, 2.70],
    position: [6.90, 2.60, -2.0],
    rotY: -Math.PI / 2,
    hasLight: false,
    accentColor: '#FFA726',
    caption: 'Together in a joyful moment',
  },
  {
    id: 'right-wall-memory-back',
    title: 'Sweet Celebration',
    year: '2026',
    imageSrc: rightBackPhoto,
    frameStyle: 'rosewood',
    size: [1.55, 2.70],
    position: [6.90, 2.60, -12.0],
    rotY: -Math.PI / 2,
    hasLight: false,
    accentColor: '#42A5F5',
    caption: 'A sweet celebration memory',
  },
];
