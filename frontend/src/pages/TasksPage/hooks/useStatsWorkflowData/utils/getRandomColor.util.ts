/** Генератор рандомного цвета */
export const getRandomColor = () =>
    `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(
        Math.random() * 256
    )}, ${Math.floor(Math.random() * 256)})`;
