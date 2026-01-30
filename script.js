const blogContainer = document.getElementById("blog-container");
const tagFilter = document.getElementById("tagFilter");
const authorFilter = document.getElementById("authorFilter");

const blogFiles = ["Blogs/blog-1.txt", "Blog/blog-2.txt"];
let blogs = [];
let activeTags = new Set();
let activeAuthors = new Set();

/* ---------- FETCH BLOGS ---------- */
Promise.all(blogFiles.map(f => fetch(f).then(r => r.text())))
    .then(texts => {
        blogs = texts.map(parseBlog);
        renderTags();
        renderAuthors();
        renderBlogs();
    });

/* ---------- PARSE BLOG ---------- */
function parseBlog(text) {
    const lines = text.split("\n");
    let data = {
        title: "",
        authors: [],
        date: "",
        tags: [],
        content: "",
        featured: false,
        id: Math.random().toString(36).substr(2, 9)
    };
    let contentStart = 0;
    lines.forEach((line,i) => {
        const low = line.toLowerCase();
        if(low.startsWith("title:")) data.title = line.split(":")[1].trim();
        if(low.startsWith("authors:")) data.authors = line.split(":")[1].split(",").map(a=>a.trim());
        if(low.startsWith("date:")) data.date = line.split(":")[1].trim();
        if(low.startsWith("tags:")) data.tags = line.split(":")[1].split(",").map(t=>t.trim());
        if(low.startsWith("featured:")) data.featured = line.split(":")[1].trim().toLowerCase() === "true";
        if(line.trim() === "" && contentStart===0) contentStart = i+1;
    });
    data.content = lines.slice(contentStart).join("\n");
    return data;
}

/* ---------- TAG FILTER ---------- */
function renderTags(){
    const tags = [...new Set(blogs.flatMap(b=>b.tags))];
    tagFilter.innerHTML = tags.map(t => `<div class="tag" data-tag="${t}">${t}</div>`).join("");
    tagFilter.querySelectorAll(".tag").forEach(el=>{
        el.onclick = ()=>{
            el.classList.toggle("active");
            activeTags.has(el.dataset.tag) ? activeTags.delete(el.dataset.tag) : activeTags.add(el.dataset.tag);
            renderBlogs();
        }
    });
}

/* ---------- AUTHOR FILTER ---------- */
function renderAuthors(){
    const authors = [...new Set(blogs.flatMap(b=>b.authors))];
    authorFilter.innerHTML = authors.map(a=>`<div class="author" data-author="${a}">${a}</div>`).join("");
    authorFilter.querySelectorAll(".author").forEach(el=>{
        el.onclick = ()=>{
            el.classList.toggle("active");
            activeAuthors.has(el.dataset.author) ? activeAuthors.delete(el.dataset.author) : activeAuthors.add(el.dataset.author);
            renderBlogs();
        }
    });
}

/* ---------- RENDER BLOGS ---------- */
function renderBlogs(){
    blogContainer.innerHTML = "";

    const featured = blogs.find(b=>b.featured);
    const nonFeatured = blogs.filter(b=>!b.featured);

    if(featured){
        blogContainer.innerHTML += `<div class="featured-heading">Featured Blog</div>`;
        blogContainer.innerHTML += renderSingleBlog(featured,true);
    }

    if(nonFeatured.length>0){
        blogContainer.innerHTML += `<div class="blogs-heading">Blogs</div>`;
        nonFeatured
            .filter(b=>[...activeTags].every(t=>b.tags.includes(t)) && [...activeAuthors].every(a=>b.authors.includes(a)))
            .forEach(b=>{
                blogContainer.innerHTML += renderSingleBlog(b,false);
            });
    }

    // Show message if no blog matches filters
    if((!featured || !([].every(t=>featured.tags.includes(t)))) && 
       nonFeatured.filter(b=>[...activeTags].every(t=>b.tags.includes(t)) && [...activeAuthors].every(a=>b.authors.includes(a))).length===0){
        blogContainer.innerHTML += `<p style="text-align:center; margin-top:40px; opacity:0.7;">No blogs found matching all selected filters. Try different tags/authors.</p>`;
    }
}

/* ---------- RENDER SINGLE BLOG ---------- */
/* ---------- RENDER SINGLE BLOG ---------- */
/* ---------- RENDER SINGLE BLOG ---------- */
function renderSingleBlog(blog, isFeatured) {
    return `
    <article id="blog-${blog.id}" class="blog-post ${isFeatured ? 'featured-blog' : ''}">
        <h2>${blog.title}</h2>
        <div class="meta">${blog.authors.join(", ")} • ${blog.date}</div>
        <div class="blog-content">${blog.content}</div>

        <div class="tags-share-container">
            <div class="blog-tags">
                ${blog.tags.map(t => `<span class="tag">${t}</span>`).join("")}
            </div>
            <div class="share-buttons">
                <span class="share-btn" title="Share on X" onclick="shareX('${blog.title}', '${blog.id}')">
                    <img src="assets/x.png" alt="X">
                </span>
                <span class="share-btn" title="Share on Facebook" onclick="shareFB('${blog.title}', '${blog.id}')">
                    <img src="assets/facebook.png" alt="Facebook">
                </span>
                <span class="share-btn" title="Copy Link" onclick="copyLink('${blog.id}')">
                    🔗
                </span>
            </div>
        </div>
    </article>
    `;
}





/* ---------- INTERNAL TOAST ---------- */
function showToast(message){
    let toast = document.createElement("div");
    toast.className = "toast-message";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(()=> toast.remove(),2000);
}

/* ---------- SHARE FUNCTIONS ---------- */
function copyLink(id){
    const url = `${window.location.href.split('#')[0]}#blog-${id}`;
    navigator.clipboard.writeText(url).then(()=>showToast("Link copied!"));
}

function shareX(title,id){
    const url = `${window.location.href.split('#')[0]}#blog-${id}`;
    window.open(`https://twitter.com/intent/tweet?text=Read about "${title}" ${url}`,'_blank');
}

function shareFB(title,id){
    const url = `${window.location.href.split('#')[0]}#blog-${id}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=Read about "${title}"`,'_blank');
}



/* ---------- BACKGROUND MOTION ---------- */
const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");
let w,h,particles=[];

function resize(){ w=canvas.width=window.innerWidth; h=canvas.height=window.innerHeight; }
window.addEventListener("resize",resize);
resize();

for(let i=0;i<70;i++){
    particles.push({x:Math.random()*w,y:Math.random()*h,r:Math.random()*2+1,v:Math.random()*0.3+0.1});
}

function animate(){
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle="rgba(199,164,93,0.35)";
    particles.forEach(p=>{
        p.y-=p.v;
        if(p.y<0) p.y=h;
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fill();
    });
    requestAnimationFrame(animate);
}
animate();
