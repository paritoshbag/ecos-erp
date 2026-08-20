import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorker;

export async function rasterizePdfFirstPage(file: File): Promise<File> {
    const data = await file.arrayBuffer();
    const pdf = await getDocument({ data }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('Could not read this PDF.');
    }

    await page.render({
        canvas,
        canvasContext: context,
        viewport,
    }).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => {
            if (result) {
                resolve(result);
            } else {
                reject(new Error('Could not convert this PDF.'));
            }
        }, 'image/png');
    });

    return new File([blob], file.name.replace(/\.pdf$/i, '.png'), {
        type: 'image/png',
    });
}
