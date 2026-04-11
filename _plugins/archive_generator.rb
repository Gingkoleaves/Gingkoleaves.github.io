# -*- coding: utf-8 -*-

module Jekyll
  class ArchiveGenerator < Generator
    safe true
    priority :low

    def generate(site)
      # Collect tags and categories from both notes and talks
      tags = {}
      categories = {}
      
      # Process notes collection
      if site.collections['notes']
        site.collections['notes'].docs.each do |doc|
          process_document(doc, tags, categories)
        end
      end
      
      # Process talks collection
      if site.collections['talks']
        site.collections['talks'].docs.each do |doc|
          process_document(doc, tags, categories)
        end
      end
      
      # Generate tag pages
      tags.each do |tag, posts|
        next if static_archive_page_exists?(site, '/tags/', tag)
        generate_archive_page(site, tag, posts, 'tag', '/tags/')
      end
      
      # Generate category pages
      categories.each do |category, posts|
        next if static_archive_page_exists?(site, '/categories/', category)
        generate_archive_page(site, category, posts, 'category', '/categories/')
      end
    end

    def static_archive_page_exists?(site, base_path, name)
      slug = Jekyll::Utils.slugify(name)
      base_dir = base_path.sub(%r{^/}, '').sub(%r{/$}, '')

      File.exist?(site.in_source_dir(base_dir, slug, 'index.md')) ||
        File.exist?(site.in_source_dir(base_dir, slug, 'index.html'))
    end
    
    def process_document(doc, tags, categories)
      # Collect tags
      if doc.data['tags']
        Array(doc.data['tags']).each do |tag|
          tags[tag] ||= []
          tags[tag] << doc
        end
      end
      
      # Collect categories
      if doc.data['categories']
        Array(doc.data['categories']).each do |category|
          categories[category] ||= []
          categories[category] << doc
        end
      end
    end
    
    def generate_archive_page(site, name, posts, type, base_path)
      # Sort posts by date descending
      sorted_posts = posts.sort_by { |p| p.data['date'] }.reverse
      
      # Create archive page
      archive = ArchivePage.new(site, name, sorted_posts, type, base_path)
      site.pages << archive
    end
  end
  
  class ArchivePage < Page
    def initialize(site, tag, posts, type, base_path)
      @site = site
      @base = site.source
      @dir = File.join(base_path.sub(/^\//, ''), Jekyll::Utils.slugify(tag))
      @name = 'index.html'
      
      self.process(@name)
      self.read_yaml(File.join(@base, '_layouts'), 'archive.html')
      
      self.data['layout'] = 'archive'
      self.data['title'] = tag
      self.data['type'] = type
      self.data['posts'] = posts
    end
  end
end
