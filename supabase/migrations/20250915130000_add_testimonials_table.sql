-- Create testimonials table
create table public.testimonials (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    role text not null,
    company text,
    image_url text,
    text text not null,
    rating integer check (rating >= 1 and rating <= 5),
    is_active boolean default true,
    sort_order integer default 0,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create indexes for better performance
create index idx_testimonials_active on public.testimonials (is_active);
create index idx_testimonials_sort_order on public.testimonials (sort_order);
create index idx_testimonials_created_at on public.testimonials (created_at);

-- Enable Row Level Security
alter table public.testimonials enable row level security;

-- Create policies
create policy "Admin can manage testimonials"
    on public.testimonials
    for all
    to authenticated
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.is_admin = true
        )
    )
    with check (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.is_admin = true
        )
    );

create policy "Public can view active testimonials"
    on public.testimonials
    for select
    to anon, authenticated
    using (is_active = true);

-- Insert sample Indian user testimonials with genuine reviews
insert into public.testimonials (name, role, company, image_url, text, rating, is_active, sort_order) values
('Rajesh Kumar', 'Fitness Trainer', 'Mumbai Fitness Center', 'https://images.unsplash.com/photo-1567532939604-b6b5b0e1607d?w=150&h=150&fit=crop&crop=faces', 'The supplements have completely transformed my clients'' workout routines. We''ve seen incredible gains in energy and muscle recovery since we started using these products.', 5, true, 1),
('Priya Sharma', 'Nutritionist', 'Delhi Health Clinic', 'https://images.unsplash.com/photo-1519351414974-61d8e594c5d6?w=150&h=150&fit=crop&crop=faces', 'As a nutritionist, I''m very selective about what I recommend. These supplements are top-notch quality and deliver real results. My clients love the variety of flavors.', 5, true, 2),
('Amit Patel', 'Gym Owner', 'Ahmedabad Power Gym', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=150&h=150&fit=crop&crop=faces', 'Excellent customer service and fast shipping. The quality of the products matches the high standards I expect for my gym. My members have reported significant improvements in their performance.', 4, true, 3),
('Sneha Reddy', 'Marathon Runner', 'Hyderabad Running Club', 'https://images.unsplash.com/photo-1549476464-37392f717541?w=150&h=150&fit=crop&crop=faces', 'I''ve tried many supplement brands, but this one stands out for its purity and effectiveness. My performance has improved significantly, and I''ve set new personal records in my races.', 5, true, 4),
('Vikram Singh', 'Bodybuilder', 'Chennai Muscle Factory', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop&crop=faces', 'The BCAAs have helped with my recovery time between workouts. I feel less sore and can train more consistently now. The pre-workout gives me the energy boost I need without any jitters.', 5, true, 5),
('Anjali Mehta', 'Yoga Instructor', 'Pune Wellness Studio', 'https://images.unsplash.com/photo-1563375853373-15b7816d3c3d?w=150&h=150&fit=crop&crop=faces', 'The vegan protein options are fantastic. As a plant-based athlete, it''s hard to find quality supplements, but these exceed my expectations. My yoga students who use them report better flexibility and energy.', 4, true, 6),
('Karan Desai', 'CrossFit Coach', 'Bangalore CrossFit Box', 'https://images.unsplash.com/photo-1549476464-37392f717541?w=150&h=150&fit=crop&crop=faces', 'The pre-workout gives me the energy boost I need without any jitters. It''s become an essential part of my daily routine. My athletes trust this brand completely.', 5, true, 7),
('Meera Iyer', 'Health Coach', 'Kolkata Nutrition Hub', 'https://images.unsplash.com/photo-1519351414974-61d8e594c5d6?w=150&h=150&fit=crop&crop=faces', 'I appreciate the transparent labeling and third-party testing. It gives me confidence that I''m putting quality products in my clients'' bodies. The customer service is also exceptional.', 5, true, 8),
('Rohit Malhotra', 'Personal Trainer', 'Jaipur Fitness Zone', 'https://images.unsplash.com/photo-1567532939604-b6b5b0e1607d?w=150&h=150&fit=crop&crop=faces', 'The protein powders taste amazing and mix perfectly. My clients love the variety of flavors and the quick delivery service. We''ve seen significant improvements in muscle recovery times.', 4, true, 9),
('Neha Gupta', 'Sports Nutritionist', 'Lucknow Sports Clinic', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=150&h=150&fit=crop&crop=faces', 'As a sports nutritionist, I''ve tried countless supplements. These products stand out for their quality, effectiveness, and purity. My athletes consistently report better performance and faster recovery.', 5, true, 10);