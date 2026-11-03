import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/active_module_badge.dart';

/// Modelo ligero para películas en cartelera
class MovieItem {
  final String id;
  final String title;
  final String genre;
  final String duration;
  final String rating;
  final String posterUrl;
  final String synopsis;
  final List<String> showtimes;
  final String room;

  const MovieItem({
    required this.id,
    required this.title,
    required this.genre,
    required this.duration,
    required this.rating,
    required this.posterUrl,
    required this.synopsis,
    required this.showtimes,
    required this.room,
  });
}

/// Vista Primaria Obligatoria del Cliente (ROLE_CUSTOMER)
/// Despliega el catálogo de películas y funciones disponibles en Cine Center.
class BillboardView extends StatelessWidget {
  const BillboardView({super.key});

  static const List<MovieItem> featuredMovies = [
    MovieItem(
      id: 'MOV-01',
      title: 'Dune: Parte Dos',
      genre: 'Ciencia Ficción • Aventura',
      duration: '166 min',
      rating: '+13',
      posterUrl: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
      synopsis: 'Paul Atreides se une a Chani y a los Fremen mientras busca venganza contra los conspiradores que destruyeron a su familia.',
      showtimes: ['15:30', '18:00', '20:30', '22:45'],
      room: 'Sala 1 (IMAX)',
    ),
    MovieItem(
      id: 'MOV-02',
      title: 'Oppenheimer',
      genre: 'Drama • Biografía • Historia',
      duration: '180 min',
      rating: '+14',
      posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      synopsis: 'La historia del físico J. Robert Oppenheimer y su papel en el desarrollo de la bomba atómica durante el Proyecto Manhattan.',
      showtimes: ['14:00', '17:45', '21:15'],
      room: 'Sala 3 (MacroXE)',
    ),
    MovieItem(
      id: 'MOV-03',
      title: 'Spider-Man: Across the Spider-Verse',
      genre: 'Animación • Acción • Aventura',
      duration: '140 min',
      rating: 'TE',
      posterUrl: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
      synopsis: 'Miles Morales es catapultado a través del Multiverso, donde se encuentra con un equipo de Spider-People.',
      showtimes: ['13:15', '16:00', '18:45', '21:30'],
      room: 'Sala 2 (3D Atmos)',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cartelera Cine Center'),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 12.0),
            child: ActiveModuleBadge(),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(vertical: 16),
        children: [
          // Banner destacado
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF8B0000), AppTheme.surfaceDark],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.borderDark),
              ),
              child: const Row(
                children: [
                  Icon(Icons.stars_rounded, color: AppTheme.accentGold, size: 36),
                  SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'ESTRENOS DE LA SEMANA',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.accentGold,
                            letterSpacing: 0.5,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Disfruta la máxima experiencia en salas IMAX y MacroXE',
                          style: TextStyle(
                            fontSize: 13,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Título de sección
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0),
            child: Text(
              'En Cartelera Hoy',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppTheme.textPrimary,
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Lista de películas
          ...featuredMovies.map((movie) => _buildMovieCard(context, movie)),
        ],
      ),
    );
  }

  Widget _buildMovieCard(BuildContext context, MovieItem movie) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: AppTheme.cardDark,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.borderDark),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(14.0),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Afiche estilizado
                Container(
                  width: 80,
                  height: 110,
                  decoration: BoxDecoration(
                    color: AppTheme.surfaceDark,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppTheme.borderDark),
                  ),
                  child: const Center(
                    child: Icon(Icons.movie_rounded, color: AppTheme.primaryRed, size: 36),
                  ),
                ),
                const SizedBox(width: 14),
                // Datos de la película
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        movie.title,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        movie.genre,
                        style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryRed.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              movie.rating,
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.primaryRed,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            movie.duration,
                            style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            movie.room,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AppTheme.accentGold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        movie.synopsis,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppTheme.borderDark),
          // Horarios disponibles
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            child: Row(
              children: [
                const Text(
                  'Horarios:',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textSecondary),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Wrap(
                    spacing: 8,
                    runSpacing: 4,
                    children: movie.showtimes.map((time) {
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.surfaceDark,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: AppTheme.borderDark),
                        ),
                        child: Text(
                          time,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
