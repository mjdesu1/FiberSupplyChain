import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export class ArticlesController {
  // Get all articles (public)
  static async getAllArticles(req: Request, res: Response) {
    try {
      const { category } = req.query;

      let query = supabase
        .from('articles')
        .select('*')
        .order('published_date', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ error: 'Failed to fetch articles' });
        return;
      }

      res.status(200).json({ articles: data || [] });
    } catch (error) {
      console.error('Error in getAllArticles:', error);
      res.status(500).json({ error: 'Failed to fetch articles' });
    }
  }

  // Get single article by ID (public)
  static async getArticleById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('article_id', id)
        .single();

      if (error) {
        console.error('Error fetching article:', error);
        res.status(404).json({ error: 'Article not found' });
        return;
      }

      res.status(200).json(data);
    } catch (error) {
      console.error('Error in getArticleById:', error);
      res.status(500).json({ error: 'Failed to fetch article' });
    }
  }

  // Create new article (super admin only)
  static async createArticle(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const isSuperAdmin = req.user?.isSuperAdmin;

      if (!isSuperAdmin) {
        res.status(403).json({ error: 'Only super admins can create articles' });
        return;
      }

      const {
        title,
        category,
        excerpt,
        content,
        image_url,
        author,
        published_date
      } = req.body;

      // Validate required fields
      if (!title || !category || !excerpt || !content) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const { data, error } = await supabase
        .from('articles')
        .insert({
          title,
          category,
          excerpt,
          content,
          image_url,
          author,
          published_date: published_date || new Date().toISOString().split('T')[0],
          created_by: userId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating article:', error);
        res.status(500).json({ error: 'Failed to create article' });
        return;
      }

      res.status(201).json({ message: 'Article created successfully', article: data });
    } catch (error) {
      console.error('Error in createArticle:', error);
      res.status(500).json({ error: 'Failed to create article' });
    }
  }

  // Update article (super admin only)
  static async updateArticle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const isSuperAdmin = req.user?.isSuperAdmin;

      if (!isSuperAdmin) {
        res.status(403).json({ error: 'Only super admins can update articles' });
        return;
      }

      const {
        title,
        category,
        excerpt,
        content,
        image_url,
        author,
        published_date
      } = req.body;

      const { data, error } = await supabase
        .from('articles')
        .update({
          title,
          category,
          excerpt,
          content,
          image_url,
          author,
          published_date,
          updated_at: new Date().toISOString()
        })
        .eq('article_id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating article:', error);
        res.status(500).json({ error: 'Failed to update article' });
        return;
      }

      res.status(200).json({ message: 'Article updated successfully', article: data });
    } catch (error) {
      console.error('Error in updateArticle:', error);
      res.status(500).json({ error: 'Failed to update article' });
    }
  }

  // Delete article (super admin only)
  static async deleteArticle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const isSuperAdmin = req.user?.isSuperAdmin;

      if (!isSuperAdmin) {
        res.status(403).json({ error: 'Only super admins can delete articles' });
        return;
      }

      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('article_id', id);

      if (error) {
        console.error('Error deleting article:', error);
        res.status(500).json({ error: 'Failed to delete article' });
        return;
      }

      res.status(200).json({ message: 'Article deleted successfully' });
    } catch (error) {
      console.error('Error in deleteArticle:', error);
      res.status(500).json({ error: 'Failed to delete article' });
    }
  }
}
