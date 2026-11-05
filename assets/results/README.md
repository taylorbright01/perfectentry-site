# Community results gallery

Add your result images to this folder and commit/upload them to the main branch. The gallery is rebuilt automatically by the **Update community results gallery** GitHub workflow. Publish the updated main branch through the site's normal deployment flow.

Supported: JPG, JPEG, PNG, WebP, AVIF and GIF. Subfolders work too. SVG files and hidden files are not included. Use numbered filenames such as `01-result.jpg` if you want a specific order. Removing an image removes it from the gallery after the next update.

The existing ten result images are included as a starting collection. Add only images you have permission to publish, with personal or account details removed where needed.

For local work, run `npm run build:site`. It rebuilds both the shared navigation and the gallery. No gallery HTML edits are needed.
