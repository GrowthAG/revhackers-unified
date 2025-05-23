

const API_URL = 'https://blog.revhackers.com.br/wp-json/wp/v2/posts?_embed';

export async function getAllPosts() {
  try {
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transformar os dados da API do WordPress para o formato usado pelo nosso site
    return data.map(post => ({
      id: post.id,
      title: post.title.rendered,
      slug: post.slug,
      excerpt: post.excerpt.rendered,
      content: post.content.rendered,
      date: post.date,
      readTime: `${Math.ceil(post.content.rendered.length / 1500)} min de leitura`,
      image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 
             getDefaultImageForCategory(getPostCategory(post)),
      category: getPostCategory(post),
      author: {
        name: post._embedded?.author?.[0]?.name || "Giulliano Alves",
        role: getCustomAuthorRole(post._embedded?.author?.[0]?.name),
        avatar: post._embedded?.author?.[0]?.avatar_urls?.['96'] || 
                post._embedded?.author?.[0]?.avatar_urls?.['48'] || 
                "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
      }
    }));
  } catch (error) {
    console.error("Erro ao carregar posts do blog:", error);
    return [];
  }
}

// Função para extrair a categoria do post do WordPress
function getPostCategory(post) {
  if (post._embedded && post._embedded['wp:term']) {
    const categories = post._embedded['wp:term'].find(terms => 
      terms.length > 0 && terms[0].taxonomy === 'category'
    );
    
    if (categories && categories.length > 0) {
      return categories[0].name;
    }
  }
  
  return "Blog"; // Categoria padrão se não encontrar
}

// Função para definir o cargo personalizado com base no nome do autor
function getCustomAuthorRole(authorName) {
  if (!authorName) return "CEO da RevHackers";
  
  switch(authorName) {
    case "Luna":
      return "Analista de marketing e Redatora";
    case "Giulliano Alves":
      return "CEO da RevHackers";
    default:
      return "Equipe RevHackers";
  }
}

// Função para obter uma imagem padrão baseada na categoria
function getDefaultImageForCategory(category) {
  switch(category) {
    case "RevOps":
      return "https://images.unsplash.com/photo-1553484771-047a44eee27a?q=80&w=1800&auto=format&fit=crop";
    case "Account Based Marketing":
    case "ABM":
      return "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1800&auto=format&fit=crop";
    case "PLG":
      return "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1800&auto=format&fit=crop";
    case "Polemic Led Growth":
      return "/lovable-uploads/116be6ad-cd44-4cf3-b9aa-fac29176a53c.png";
    default:
      return "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1800&auto=format&fit=crop";
  }
}

