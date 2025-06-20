export interface Database {
  public: {
    Tables: {
      classes: {
        Row: {
          id: number
          name: string
          description: string
          isActive: boolean
          created_at: string
          updatedAt: string
        }
        Insert: {
          id?: number
          name: string
          description: string
          isActive?: boolean
          created_at?: string
          updatedAt?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string
          isActive?: boolean
          created_at?: string
          updatedAt?: string
        }
      }
      subjects: {
        Row: {
          id: string
          name: string
          icon: string
          color: string
          isLocked: boolean
          orderIndex: number
          classId: number
          created_at: string
          updatedAt: string
        }
        Insert: {
          id?: string
          name: string
          icon: string
          color: string
          isLocked?: boolean
          orderIndex: number
          classId: number
          created_at?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string
          icon?: string
          color?: string
          isLocked?: boolean
          orderIndex?: number
          classId?: number
          created_at?: string
          updatedAt?: string
        }
      }
      chapters: {
        Row: {
          id: string
          name: string
          orderIndex: number
          subjectId: string
          created_at: string
          updatedAt: string
        }
        Insert: {
          id?: string
          name: string
          orderIndex: number
          subjectId: string
          created_at?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string
          orderIndex?: number
          subjectId?: string
          created_at?: string
          updatedAt?: string
        }
      }
      topics: {
        Row: {
          id: string
          name: string
          type: 'video' | 'interactive' | 'exercise' | 'audio'
          duration: string
          orderIndex: number
          chapterId: string
          created_at: string
          updatedAt: string
        }
        Insert: {
          id?: string
          name: string
          type: 'video' | 'interactive' | 'exercise' | 'audio'
          duration: string
          orderIndex: number
          chapterId: string
          created_at?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'video' | 'interactive' | 'exercise' | 'audio'
          duration?: string
          orderIndex?: number
          chapterId?: string
          created_at?: string
          updatedAt?: string
        }
      }
      topic_contents: {
        Row: {
          id: string
          topicId: string
          contentType: 'external_link' | 'video' | 'pdf' | 'text' | 'interactive_widget'
          url: string | null
          videoUrl: string | null
          pdfUrl: string | null
          textContent: string | null
          widgetConfig: Record<string, unknown> | null
          created_at: string
          updatedAt: string
        }
        Insert: {
          id?: string
          topicId: string
          contentType: 'external_link' | 'video' | 'pdf' | 'text' | 'interactive_widget'
          url?: string | null
          videoUrl?: string | null
          pdfUrl?: string | null
          textContent?: string | null
          widgetConfig: Record<string, unknown> | null
          created_at?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          topicId?: string
          contentType?: 'external_link' | 'video' | 'pdf' | 'text' | 'interactive_widget'
          url?: string | null
          videoUrl?: string | null
          pdfUrl?: string | null
          textContent?: string | null
          widgetConfig: Record<string, unknown> | null
          created_at?: string
          updatedAt?: string
        }
      }
      user_topic_progress: {
        Row: {
          id: string
          userId: string
          topicId: string
          completed: boolean
          completedAt: string | null
          timeSpent: number | null
          created_at: string
          updatedAt: string
        }
        Insert: {
          id?: string
          userId: string
          topicId: string
          completed?: boolean
          completedAt?: string | null
          timeSpent?: number | null
          created_at?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          userId?: string
          topicId?: string
          completed?: boolean
          completedAt?: string | null
          timeSpent?: number | null
          created_at?: string
          updatedAt?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          displayName: string | null
          photoURL: string | null
          role: 'USER' | 'ADMIN' | 'MODERATOR' | 'TEACHER'
          isActive: boolean
          lastLoginAt: string | null
          created_at: string
          updatedAt: string
        }
        Insert: {
          id: string
          email: string
          displayName?: string | null
          photoURL?: string | null
          role?: 'USER' | 'ADMIN' | 'MODERATOR' | 'TEACHER'
          isActive?: boolean
          lastLoginAt?: string | null
          created_at?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          email?: string
          displayName?: string | null
          photoURL?: string | null
          role?: 'USER' | 'ADMIN' | 'MODERATOR' | 'TEACHER'
          isActive?: boolean
          lastLoginAt?: string | null
          created_at?: string
          updatedAt?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          userId: string
          status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'EXPIRED' | 'TRIAL'
          planType: string
          planName: string | null
          amount: number | null
          currency: string
          startDate: string
          endDate: string | null
          autoRenew: boolean
          created_at: string
          updatedAt: string
        }
        Insert: {
          id?: string
          userId: string
          status?: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'EXPIRED' | 'TRIAL'
          planType: string
          planName?: string | null
          amount?: number | null
          currency?: string
          startDate?: string
          endDate?: string | null
          autoRenew?: boolean
          created_at?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          userId?: string
          status?: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'EXPIRED' | 'TRIAL'
          planType?: string
          planName?: string | null
          amount?: number | null
          currency?: string
          startDate?: string
          endDate?: string | null
          autoRenew?: boolean
          created_at?: string
          updatedAt?: string
        }
      }
      payments: {
        Row: {
          id: string
          userId: string
          razorpayPaymentId: string | null
          razorpayOrderId: string | null
          razorpaySignature: string | null
          amount: number
          currency: string
          status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED'
          paymentMethod: string | null
          description: string | null
          failureReason: string | null
          refundId: string | null
          metadata: Record<string, unknown> | null
          created_at: string
          updatedAt: string
        }
        Insert: {
          id?: string
          userId: string
          razorpayPaymentId?: string | null
          razorpayOrderId?: string | null
          razorpaySignature?: string | null
          amount: number
          currency?: string
          status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED'
          paymentMethod?: string | null
          description?: string | null
          failureReason?: string | null
          refundId?: string | null
          metadata?: Record<string, unknown> | null
          created_at?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          userId?: string
          razorpayPaymentId?: string | null
          razorpayOrderId?: string | null
          razorpaySignature?: string | null
          amount?: number
          currency?: string
          status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED'
          paymentMethod?: string | null
          description?: string | null
          failureReason?: string | null
          refundId?: string | null
          metadata?: Record<string, unknown> | null
          created_at?: string
          updatedAt?: string
        }
      }
    }
  }
}
